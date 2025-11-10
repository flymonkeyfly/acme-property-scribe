const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listing, enrichment, brand } = await req.json();
    if (!listing || !enrichment) return Response.json({ ok:false, error:"listing + enrichment required" }, { status:400, headers: corsHeaders });

    const css = `
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; }
        header { display:flex; align-items:center; justify-content:space-between; }
        h1 { font-size: 24px; margin: 16px 0; }
        h2 { font-size: 18px; margin: 16px 0 6px; }
        .grid { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
        .badge { display:inline-block; padding:2px 8px; border:1px solid #ccc; border-radius:4px; margin-right:6px; font-size:12px; }
        .section { margin: 16px 0; }
        .disclaimer { font-size: 12px; color:#555; margin-top: 24px; }
        @media print { a[href]:after { content:""; } }
      </style>
    `;
    const h = (title:string, body:string) => `<div class="section"><h2>${title}</h2>${body}</div>`;

    const overlays = (enrichment.planning_overlays_json?.overlays||[]).map((o:any)=>`<span class="badge">${o.code||""}</span>`).join("");
    const schools = (enrichment.schools_json?.top3||[]).map((s:any)=>`<li>${s.name} · ${s.sector} · ~${s.distance_m} m</li>`).join("");
    const pois = (enrichment.pois_json?.places||[]).slice(0,6).map((p:any)=>`<li>${p.type} — ${p.displayName?.text || p.name || "Place"}</li>`).join("");
    const med = enrichment.suburb_medians_json
      ? `<pre>${JSON.stringify(enrichment.suburb_medians_json, null, 2)}</pre>` : "<em>No median data</em>";

    const html = `
      <!doctype html><html><head><meta charset="utf-8">${css}</head><body>
      <header>
        <div>
          <div style="font-weight:600">${brand?.agency_name || "ACME Real Estate"}</div>
          <div style="font-size:12px">${brand?.tagline || "Local knowledge, precise marketing"}</div>
        </div>
        ${brand?.logo_url ? `<img src="${brand.logo_url}" alt="logo" height="40"/>` : ""}
      </header>

      <h1>${listing.address_line}, ${listing.suburb} ${listing.postcode}</h1>

      ${h("At‑a‑glance", `
        <div class="grid">
          <div><strong>${listing.beds||"-"}</strong> beds · <strong>${listing.baths||"-"}</strong> baths · <strong>${listing.cars||"-"}</strong> cars</div>
          <div>Land ~${listing.land_size_sqm||"—"} m² · Type: ${listing.property_type||"—"}</div>
        </div>
      `)}

      ${h("Schools (nearest)", `<ul>${schools||"<li>—</li>"}</ul>
        ${enrichment.schools_json?.find_my_school_url ? `<a href="${enrichment.schools_json.find_my_school_url}">Check official school zones</a>` : ""}`)}

      ${h("Planning & overlays", `${overlays||"<em>No overlays parsed (verify)</em>"} 
        ${enrichment.planning_overlays_json?.verify_link ? `<div><a href="${enrichment.planning_overlays_json.verify_link}">Verify in VicPlan</a></div>` : ""}`)}

      ${h("Heritage", `
        ${(enrichment.heritage_json?.records||[]).length ? `<ul>${(enrichment.heritage_json.records||[]).map((x:any)=>`<li>${x.name||"Record"}</li>`).join("")}</ul>` : "<em>None found in search radius; verify via council/official DB.</em>"}
        ${enrichment.heritage_json?.verify_link ? `<div><a href="${enrichment.heritage_json.verify_link}">Check Victorian Heritage Database</a></div>` : ""}
      `)}

      ${h("Transport", `
        ${(enrichment.ptv_json?.nearest||[]).length ? `<ul>${(enrichment.ptv_json.nearest||[]).map((s:any)=>`<li>${s.stop_name||"Stop"}</li>`).join("")}</ul>` : "<em>—</em>"}
        ${enrichment.ptv_json?.verify_link ? `<div><a href="${enrichment.ptv_json.verify_link}">Verify on PTV</a></div>` : ""}
      `)}

      ${h("Lifestyle POIs", `<ul>${pois||"<li>—</li>"}</ul>`)}

      ${h("Market (suburb medians, 10y)", med)}

      <div class="disclaimer">
        <p><strong>Disclaimers</strong></p>
        <ul>
          <li>School zones and planning controls can change. Always verify via official sources.</li>
          <li>Suburb medians are indicative statistics; not a valuation.</li>
          <li>A Statement of Information (SoI) is required for VIC residential listings. Provide and link the SoI.</li>
        </ul>
      </div>
      </body></html>
    `;

    const pdfApi = Deno.env.get("PDF_API_URL");
    if (pdfApi) {
      const r = await fetch(pdfApi, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization": `Bearer ${Deno.env.get("PDF_API_KEY")||""}` },
        body: JSON.stringify({ html })
      });
      if (!r.ok) return Response.json({ ok:false, error:`PDF service failed: ${r.status}` }, { status:500, headers: corsHeaders });
      const jr = await r.json();
      return Response.json({ ok:true, data:{ pdf_url: jr.url || jr.file || null } }, { headers: corsHeaders });
    }
    return Response.json({ ok:true, data:{ html }, disclaimer:"No PDF service configured; use browser Print to PDF." }, { headers: corsHeaders });
  } catch (e) {
    console.error("Render property pack error:", e);
    return Response.json({ ok:false, error:String(e) }, { status:500, headers: corsHeaders });
  }
});
