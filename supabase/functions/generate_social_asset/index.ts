const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assetType, listingData, caption } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt based on asset type
    let prompt = '';
    const address = `${listingData.address_line}, ${listingData.suburb}`;
    
    switch (assetType) {
      case 'post':
        prompt = `Create a professional Instagram square post for a luxury real estate property at ${address}. ${listingData.beds} bedrooms, ${listingData.baths} bathrooms, ${listingData.land_size_sqm} sqm land. Modern architectural design with clean lines, timber cladding, and premium finishes. Make it elegant, aspirational, and suitable for luxury property marketing. Include subtle property details overlay.`;
        break;
      case 'reels_short':
        prompt = `Create a dynamic Instagram reel cover for a luxury property at ${address}. ${listingData.beds}BR/${listingData.baths}BA modern home. Eye-catching, vertical format, perfect for a quick property tour video. Bold, energetic, premium feel.`;
        break;
      case 'reels_long':
        prompt = `Create a cinematic Instagram reel thumbnail for an in-depth property tour of ${address}. Showcase the modern architecture, ${listingData.beds} bedrooms, ${listingData.baths} bathrooms. Sophisticated, high-end, worthy of a luxury home walkthrough video.`;
        break;
      case 'reels_deep':
        prompt = `Create an emotional, storytelling Instagram reel cover for ${address}. Focus on the lifestyle and experience of living in this ${listingData.beds} bedroom architectural masterpiece. Warm, inviting, aspirational. Perfect for a deep-dive property story.`;
        break;
      case 'carousel':
        prompt = `Create the first slide of an Instagram carousel post for ${address}. Modern luxury property, ${listingData.beds}BR/${listingData.baths}BA, ${listingData.land_size_sqm}sqm. Include text overlay saying "SWIPE FOR MORE" or similar. Clean, elegant design suitable for premium real estate.`;
        break;
      default:
        prompt = `Create a professional social media image for a luxury property at ${address}. Modern design, ${listingData.beds} bedrooms, ${listingData.baths} bathrooms. Premium real estate marketing image.`;
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
