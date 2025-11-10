const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius_m = 200 } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number")
      return Response.json({ ok:false, error:"lat/lng required" }, { status:400, headers: corsHeaders });

    const api = Deno.env.get("HERITAGE_API_URL");
    if (!api) {
      return Response.json({
        ok:true,
        data:{ records:[], verify_link:"https://heritage-list.planning.vic.gov.au/" },
        disclaimer:"Heritage listings can exist at state and local levels. Verify via Victorian Heritage Database and Council."
      }, { headers: corsHeaders });
    }

    // TODO: Implement API call to HERITAGE_API_URL when available.
    return Response.json({
      ok:true,
      data:{ records:[], verify_link:"https://heritage-list.planning.vic.gov.au/" },
      disclaimer:"Heritage listings can exist at state and local levels. Verify via Victorian Heritage Database and Council."
    }, { headers: corsHeaders });
  } catch (e) {
    console.error("Heritage lookup error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
