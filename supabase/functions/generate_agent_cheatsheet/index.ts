const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listing, enrichment } = await req.json();

    // Build comprehensive HTML document
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Agent Cheat Sheet - ${listing.address_line}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8f9fa;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { font-size: 18px; opacity: 0.9; }
    .section {
      background: white;
      padding: 30px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .stat-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .amenity-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .amenity-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
    .amenity-name {
      font-weight: 600;
      margin-bottom: 5px;
    }
    .amenity-detail {
      font-size: 14px;
      color: #666;
    }
    .highlight {
      background: #fff3cd;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
      margin: 20px 0;
    }
    .highlight h3 {
      color: #856404;
      margin-bottom: 10px;
    }
    @media print {
      body { background: white; padding: 0; }
      .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Agent Cheat Sheet</h1>
    <p>${listing.address_line}, ${listing.suburb} ${listing.state} ${listing.postcode}</p>
  </div>

  <div class="section">
    <h2>🏠 Property Highlights</h2>
    <div class="stats">
      ${listing.beds ? `<div class="stat-box"><div class="stat-value">${listing.beds}</div><div class="stat-label">Bedrooms</div></div>` : ''}
      ${listing.baths ? `<div class="stat-box"><div class="stat-value">${listing.baths}</div><div class="stat-label">Bathrooms</div></div>` : ''}
      ${listing.cars ? `<div class="stat-box"><div class="stat-value">${listing.cars}</div><div class="stat-label">Car Spaces</div></div>` : ''}
      ${listing.land_size_sqm ? `<div class="stat-box"><div class="stat-value">${listing.land_size_sqm}</div><div class="stat-label">Land Size (sqm)</div></div>` : ''}
    </div>
  </div>

  <div class="section">
    <h2>📋 Property Details</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Address:</span>
        <span class="info-value">${listing.address_line}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Suburb:</span>
        <span class="info-value">${listing.suburb}, ${listing.state} ${listing.postcode}</span>
      </div>
      ${listing.property_type ? `
      <div class="info-item">
        <span class="info-label">Property Type:</span>
        <span class="info-value" style="text-transform: capitalize;">${listing.property_type}</span>
      </div>` : ''}
      ${listing.price_guide_text ? `
      <div class="info-item">
        <span class="info-label">Price Guide:</span>
        <span class="info-value">$${parseInt(listing.price_guide_text).toLocaleString()}</span>
      </div>` : ''}
    </div>
  </div>

  ${enrichment?.schools_json?.top3?.length ? `
  <div class="section">
    <h2>🎓 Nearby Schools</h2>
    <div class="amenity-list">
      ${enrichment.schools_json.top3.map((school: any) => `
        <div class="amenity-item">
          <div class="amenity-name">${school.name}</div>
          <div class="amenity-detail">
            ${school.sector || ''} ${school.level || ''}
            ${school.distance_m ? ` • ${school.distance_m < 1000 ? school.distance_m + 'm' : (school.distance_m / 1000).toFixed(1) + 'km'}` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${enrichment?.ptv_json?.nearest?.length ? `
  <div class="section">
    <h2>🚌 Public Transport</h2>
    <div class="amenity-list">
      ${enrichment.ptv_json.nearest.map((stop: any) => `
        <div class="amenity-item">
          <div class="amenity-name">${stop.stop_name}</div>
          <div class="amenity-detail">
            ${stop.stop_suburb || ''} ${stop.distance_m ? `• ${stop.distance_m}m away` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${enrichment?.pois_json?.places?.length ? `
  <div class="section">
    <h2>🏞️ Lifestyle & Amenities</h2>
    <div class="amenity-list">
      ${enrichment.pois_json.places.slice(0, 6).map((poi: any) => `
        <div class="amenity-item">
          <div class="amenity-name">${poi.displayName?.text || poi.name || 'Nearby Place'}</div>
          <div class="amenity-detail" style="text-transform: capitalize;">${poi.type || 'Amenity'}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${enrichment?.suburb_medians_json?.house?.length ? `
  <div class="section">
    <h2>💰 Market Insights - ${enrichment.suburb_medians_json.suburb}</h2>
    <div class="info-grid">
      ${enrichment.suburb_medians_json.house.slice(0, 5).map((data: any) => `
        <div class="info-item">
          <span class="info-label">${data.year}:</span>
          <span class="info-value">$${parseInt(data.median_price).toLocaleString()} (${data.sales_count} sales)</span>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  <div class="highlight">
    <h3>✨ Key Selling Points</h3>
    <ul style="margin-left: 20px; margin-top: 10px;">
      <li>Modern ${listing.property_type || 'property'} in sought-after ${listing.suburb}</li>
      ${listing.beds ? `<li>Spacious ${listing.beds} bedroom layout ideal for families</li>` : ''}
      ${enrichment?.schools_json?.top3?.[0] ? `<li>Close to quality education at ${enrichment.schools_json.top3[0].name}</li>` : ''}
      ${enrichment?.ptv_json?.nearest?.[0] ? `<li>Convenient public transport with ${enrichment.ptv_json.nearest[0].stop_name} nearby</li>` : ''}
      ${enrichment?.pois_json?.places?.[0] ? `<li>Lifestyle amenities including parks, cafes, and shopping within easy reach</li>` : ''}
      ${listing.land_size_sqm ? `<li>Generous ${listing.land_size_sqm}sqm land size</li>` : ''}
    </ul>
  </div>

  <div class="section" style="text-align: center; color: #666;">
    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    <p style="margin-top: 10px; font-size: 14px;">Agent Cheat Sheet • Confidential Property Information</p>
  </div>
</body>
</html>
    `;

    // Check if PDF API is configured
    const PDF_API_URL = Deno.env.get('PDF_API_URL');
    
    if (PDF_API_URL) {
      // Generate PDF
      const pdfResponse = await fetch(PDF_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html })
      });

      if (pdfResponse.ok) {
        const pdfData = await pdfResponse.json();
        return new Response(
          JSON.stringify({ pdfUrl: pdfData.url }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return HTML for browser printing if PDF service not available
    return new Response(
      JSON.stringify({ html }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating cheat sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate cheat sheet';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
