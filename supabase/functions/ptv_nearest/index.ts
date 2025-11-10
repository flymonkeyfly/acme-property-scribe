const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number")
      return Response.json({ ok:false, error:"lat/lng required" }, { status:400, headers: corsHeaders });

    const hasKeys = Deno.env.get("PTV_DEV_ID") && Deno.env.get("PTV_API_KEY");
    if (!hasKeys) {
      return Response.json({
        ok:true,
        data:{ nearest:[], verify_link:"https://www.ptv.vic.gov.au/" },
        disclaimer:"Public transport details can change. Verify via PTV."
      }, { headers: corsHeaders });
    }

    // TODO: Implement PTV signed requests for v3 API.
    return Response.json({
      ok:true,
      data:{ nearest:[], verify_link:"https://www.ptv.vic.gov.au/" },
      disclaimer:"Public transport details can change. Verify via PTV."
    }, { headers: corsHeaders });
  } catch (e) {
    console.error("PTV nearest error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
