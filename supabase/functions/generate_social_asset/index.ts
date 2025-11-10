const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assetType, listingData, caption, enrichmentData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt based on asset type
    let prompt = '';
    const address = `${listingData.address_line}, ${listingData.suburb}`;
    
    // Build context about location amenities
    let locationContext = '';
    if (enrichmentData) {
      const schools = enrichmentData.schools_json?.top3?.map((s: any) => s.name).join(', ') || '';
      const transport = enrichmentData.ptv_json?.nearest?.[0]?.stop_name || '';
      const pois = enrichmentData.pois_json?.places?.map((p: any) => p.displayName?.text || p.name).slice(0, 3).join(', ') || '';
      
      locationContext = `
Location highlights:
- Nearby schools: ${schools || 'Quality schools in the area'}
- Transport: ${transport || 'Convenient public transport access'}
- Lifestyle: ${pois || 'Parks, cafes, and amenities nearby'}
`;
    }
    
    const propertyDetails = `${listingData.beds}BR | ${listingData.baths}BA | ${listingData.land_size_sqm}sqm`;
    
    switch (assetType) {
      case 'post':
        prompt = `Create a stunning Instagram square post for ${address}. 

Property: ${propertyDetails}
${locationContext}

Design: Modern architectural masterpiece with timber cladding, premium finishes, and resort-style pool. 

Marketing narrative: Imagine waking up in this coastal haven where modern luxury meets lifestyle perfection. Steps from pristine beaches, surrounded by quality schools, and connected to everything that matters. This is more than a home - it's your new lifestyle.

Include elegant text overlay with address and key details. Professional real estate marketing style, aspirational and sophisticated.`;
        break;
      case 'reels_short':
        prompt = `Create an eye-catching Instagram reel cover for ${address}.

Property: ${propertyDetails}
${locationContext}

Story: Experience coastal elegance just minutes from the beach. Premium schools, easy transport, and everything you love about peninsula living. Your dream lifestyle starts here.

Vertical format, bold text overlay with property highlights. Dynamic, energetic, premium real estate feel.`;
        break;
      case 'reels_long':
        prompt = `Create a cinematic Instagram reel cover for ${address}.

Property: ${propertyDetails}
${locationContext}

Narrative: This isn't just real estate - it's a lifestyle destination. Modern architecture meets family-friendly living in one of the peninsula's most sought-after locations. Quality schools at your doorstep, beaches moments away, and a home that showcases the very best of contemporary design.

Cinematic, sophisticated, with elegant text overlays highlighting location benefits.`;
        break;
      case 'reels_deep':
        prompt = `Create an emotional storytelling Instagram reel cover for ${address}.

Property: ${propertyDetails}
${locationContext}

Deep story: Picture Sunday mornings walking to the local cafe, afternoons by your private pool, and evenings watching sunsets from your designer living room. With top-tier schools nearby and the beach just moments away, this home offers the perfect balance of luxury, convenience, and coastal charm. This is where memories are made.

Warm, inviting, emotional. Rich storytelling aesthetic with lifestyle focus.`;
        break;
      case 'carousel':
        prompt = `Create the hero slide for an Instagram carousel about ${address}.

Property: ${propertyDetails}
${locationContext}

Hook: Discover your dream coastal lifestyle. This modern masterpiece combines architectural excellence with unbeatable location - top schools, easy transport, beach access, and everything the peninsula lifestyle offers.

Include "SWIPE FOR MORE" call-to-action. Premium design, property details overlay, location highlights teased.`;
        break;
      default:
        prompt = `Create a professional social media image for ${address}.

Property: ${propertyDetails}
${locationContext}

Lifestyle story: Live where modern luxury meets convenient coastal living. Quality schools, transport connections, and lifestyle amenities all within reach. This is peninsula living perfected.

Professional real estate marketing image with property and location highlights.`;
    }

    console.log('Generating image with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the generated image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl,
        message: data.choices?.[0]?.message?.content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating social asset:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate asset';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
