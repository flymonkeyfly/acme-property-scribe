import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { suburb } = await req.json();
    if (!suburb) return Response.json({ ok:false, error:"suburb required" }, { status:400, headers: corsHeaders });

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const supa = createClient(url, key);

    const fetchType = async (type:string) => {
      const { data, error } = await supa
        .from("vgv_medians")
        .select("year, median_price")
        .eq("suburb", suburb)
        .eq("property_type", type)
        .order("year", { ascending:true });
      if (error) throw error;
      return data;
    };

    const house = await fetchType("house");
    const unit = await fetchType("unit");

    return Response.json({
      ok:true,
      data:{ suburb, house, unit },
      disclaimer:"Medians are indicative suburb statistics; not a valuation."
    }, { headers: corsHeaders });
  } catch (e) {
    console.error("VGV medians error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
