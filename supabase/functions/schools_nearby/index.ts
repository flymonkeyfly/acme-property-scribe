import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type School = { id:number; name:string; sector:string; level:string; lat:number; lng:number; address?:string; suburb?:string; postcode?:string };

function haversine(a:{lat:number;lng:number}, b:{lat:number;lng:number}) {
  const R = 6371000; const toRad = (d:number)=>d*Math.PI/180;
  const dLat = toRad(b.lat-a.lat), dLng = toRad(b.lng-a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}

function findMySchoolLink(address:string) {
  return `https://www.findmyschool.vic.gov.au/?Address=${encodeURIComponent(address)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, address } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number")
      return Response.json({ ok:false, error:"lat/lng required" }, { status:400, headers: corsHeaders });

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const supa = createClient(url, key);
    const { data: list, error } = await supa.from("schools").select("*");
    if (error) throw error;

    const here = { lat, lng };
    const withDist = (list as School[]).map(s => ({ ...s, distance_m: Math.round(haversine(here, { lat:s.lat, lng:s.lng })) }));
    withDist.sort((a,b)=>a.distance_m-b.distance_m);
    const top3 = withDist.slice(0,3).map(s => ({
      name: s.name, sector: s.sector, level: s.level, distance_m: s.distance_m,
      address: s.address, suburb: s.suburb, postcode: s.postcode
    }));

    return Response.json({
      ok: true,
      data: { top3, find_my_school_url: address ? findMySchoolLink(address) : null },
      disclaimer: "School zones can change. Verify via the official 'Find My School' website before relying on zoning."
    }, { headers: corsHeaders });
  } catch (e) {
    console.error("Schools nearby error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
