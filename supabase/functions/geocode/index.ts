const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function googleGeocode(address: string, key: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", key);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Google geocode HTTP ${r.status}`);
  const j = await r.json();
  const best = j.results?.[0];
  if (!best) return null;
  return {
    lat: best.geometry.location.lat,
    lng: best.geometry.location.lng,
    formattedAddress: best.formatted_address,
    source: "google"
  };
}

async function nominatimGeocode(address: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", address);
  url.searchParams.set("addressdetails", "1");
  const r = await fetch(url, { headers: { "User-Agent": "ACME-RealEstate/1.0" }});
  if (!r.ok) throw new Error(`Nominatim HTTP ${r.status}`);
  const j = await r.json();
  const best = j?.[0];
  if (!best) return null;
  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    formattedAddress: best.display_name,
    source: "nominatim"
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    if (!address) return Response.json({ ok:false, error:"address required" }, { status:400, headers: corsHeaders });

    const key = Deno.env.get("GOOGLE_MAPS_API_KEY");
    let data = null;
    if (key) data = await googleGeocode(address, key).catch(()=>null);
    if (!data) data = await nominatimGeocode(address);

    if (!data) return Response.json({ ok:false, error:"no geocode result" }, { status:404, headers: corsHeaders });
    return Response.json({ ok:true, data }, { headers: corsHeaders });
  } catch (e) {
    console.error("Geocode error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
