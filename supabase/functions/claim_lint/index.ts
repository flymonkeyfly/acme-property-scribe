const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RULES = [
  { id:"school_catchment", pattern:/\bin catchment\b/i, fix:"near [School]; check official zones (link)" },
  { id:"heritage_free", pattern:/\bheritage[- ]?free\b/i, fix:"no state heritage record found nearby; verify overlays via VicPlan" },
  { id:"walk_time_abs", pattern:/\b\d+\s*[-]?\s*minute walk\b/i, fix:"~X‑minute walk (mapping estimate)" },
  { id:"price_claims", pattern:/\bunder market\b|\bbargain\b|\bguarantee\b/i, fix:"remove subjective price claims; rely on SoI & comparable sales" }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { copy } = await req.json();
    if (!copy) return Response.json({ ok:false, error:"copy required" }, { status:400, headers: corsHeaders });

    const issues = RULES
      .map(r => copy.match(r.pattern) ? { rule:r.id, suggestion:r.fix } : null)
      .filter(Boolean);

    return Response.json({ ok:true, data:{ passed: issues.length===0, issues }}, { headers: corsHeaders });
  } catch (e) {
    console.error("Claim lint error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
