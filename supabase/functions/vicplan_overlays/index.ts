import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    const endpoint = Deno.env.get("VICMAP_PLANNING_WFS_URL");
    if (!endpoint) {
      return Response.json({
        ok:true,
        data:{ zone:null, overlays:[], verify_link:"https://mapshare.vic.gov.au/vicplan/" },
        disclaimer:"Planning controls may change. Verify via VicPlan/Council."
      }, { headers: corsHeaders });
    }

    // TODO: Implement your WFS query here to resolve zone/overlays.
    // Return a safe stub + verify link so UI remains compliant.
    return Response.json({
      ok:true,
      data:{ zone:null, overlays:[], verify_link:"https://mapshare.vic.gov.au/vicplan/" },
      disclaimer:"Planning controls may change. Verify via VicPlan/Council."
    }, { headers: corsHeaders });
  } catch (e) {
    console.error("VicPlan overlays error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
