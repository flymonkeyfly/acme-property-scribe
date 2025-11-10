const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, types = ["cafe"], radius_m = 800 } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number")
      return Response.json({ ok:false, error:"lat/lng required" }, { status:400, headers: corsHeaders });

    const provider = (Deno.env.get("PLACES_PROVIDER") || "overpass").toLowerCase();
    const results:any[] = [];

    if (provider === "google" && Deno.env.get("GOOGLE_MAPS_API_KEY")) {
      const fieldMask = "places.displayName,places.location,places.rating,places.userRatingCount,places.googleMapsUri";
      const key = Deno.env.get("GOOGLE_MAPS_API_KEY")!;
      for (const t of types) {
        const url = new URL("https://places.googleapis.com/v1/places:searchNearby");
        const payload = {
          locationRestriction: { circle: { center: { latitude:lat, longitude:lng }, radius: radius_m } },
          includedTypes: [t],
          maxResultCount: 5
        };
        const r = await fetch(url, {
          method:"POST",
          headers:{ "Content-Type":"application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": fieldMask },
          body: JSON.stringify(payload)
        });
        const j = await r.json();
        (j.places || []).forEach((p:any)=>results.push({ type:t, ...p }));
      }
    } else {
      const overpass = Deno.env.get("OVERPASS_URL") || "https://overpass-api.de/api/interpreter";
      for (const t of types) {
        const clause = t === "supermarket" ? `["shop"="supermarket"]`
                    : t === "restaurant" ? `["amenity"="restaurant"]`
                    : t === "park" ? `["leisure"="park"]`
                    : t === "beach" ? `["natural"="beach"]`
                    : `["amenity"="${t}"]`;
        const q = `
          [out:json][timeout:25];
          nwr(around:${radius_m},${lat},${lng})${clause};
          out center 5;
        `;
        const r = await fetch(overpass, { method:"POST", body:`data=${encodeURIComponent(q)}`, headers:{ "Content-Type":"application/x-www-form-urlencoded" }});
        const j = await r.json();
        (j.elements||[]).slice(0,5).forEach((e:any)=>{
          const name = e.tags?.name || t;
          const loc = e.center || { lat:e.lat, lon:e.lon };
          results.push({
            type:t,
            displayName:{ text:name },
            location:{ latitude: loc.lat, longitude: loc.lon }
          });
        });
      }
    }

    return Response.json({ ok:true, data:{ places: results }}, { headers: corsHeaders });
  } catch (e) {
    console.error("Places nearby error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
