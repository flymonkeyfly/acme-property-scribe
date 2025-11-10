const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function signRequest(request: string, devId: string, apiKey: string): Promise<string> {
  const requestWithDevId = request + (request.includes('?') ? '&' : '?') + `devid=${devId}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKey);
  const messageData = encoder.encode(requestWithDevId);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  
  return `https://timetableapi.ptv.vic.gov.au${requestWithDevId}&signature=${signatureHex}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number")
      return Response.json({ ok:false, error:"lat/lng required" }, { status:400, headers: corsHeaders });

    const devId = Deno.env.get("PTV_DEV_ID");
    const apiKey = Deno.env.get("PTV_API_KEY");
    
    if (!devId || !apiKey) {
      console.log("PTV credentials not configured, returning empty results");
      return Response.json({
        ok:true,
        data:{ nearest:[], verify_link:"https://www.ptv.vic.gov.au/" },
        disclaimer:"Public transport details can change. Verify via PTV."
      }, { headers: corsHeaders });
    }

    // Search for stops within 500m, get max 10 results
    const request = `/v3/stops/location/${lat},${lng}?max_distance=500&max_results=10`;
    const signedUrl = await signRequest(request, devId, apiKey);
    
    console.log("Calling PTV API for stops near", lat, lng);
    const response = await fetch(signedUrl);
    
    if (!response.ok) {
      console.error("PTV API error:", response.status, await response.text());
      return Response.json({
        ok:true,
        data:{ nearest:[], verify_link:"https://www.ptv.vic.gov.au/" },
        disclaimer:"Public transport details can change. Verify via PTV."
      }, { headers: corsHeaders });
    }

    const data = await response.json();
    
    // Transform the response to a simpler format
    const stops = (data.stops || []).map((stop: any) => ({
      stop_id: stop.stop_id,
      stop_name: stop.stop_name,
      stop_suburb: stop.stop_suburb,
      route_type: stop.route_type,
      stop_latitude: stop.stop_latitude,
      stop_longitude: stop.stop_longitude,
      distance_m: Math.round(stop.stop_distance || 0),
    }));

    return Response.json({
      ok:true,
      data:{ 
        nearest: stops,
        verify_link:"https://www.ptv.vic.gov.au/" 
      },
      disclaimer:"Public transport details can change. Verify via PTV."
    }, { headers: corsHeaders });
    
  } catch (e) {
    console.error("PTV nearest error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
