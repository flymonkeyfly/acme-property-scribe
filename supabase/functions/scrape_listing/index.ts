import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching URL:', url);

    // Fetch the webpage
    const response = await fetch(url);
    const html = await response.text();

    // Extract property data using regex patterns
    const extractData = (html: string) => {
      const data: any = {
        address_line: '',
        suburb: '',
        postcode: '',
        beds: null,
        baths: null,
        cars: null,
        land_size_sqm: null,
        property_type: '',
        price_guide_text: ''
      };

      // Extract bedrooms (common patterns: "3 bed", "3 bedroom", "3BR", "3 Bed")
      const bedsMatch = html.match(/(\d+)\s*(?:bed(?:room)?s?|BR|Bed)/i);
      if (bedsMatch) data.beds = parseInt(bedsMatch[1]);

      // Extract bathrooms
      const bathsMatch = html.match(/(\d+)\s*(?:bath(?:room)?s?|BA|Bath)/i);
      if (bathsMatch) data.baths = parseInt(bathsMatch[1]);

      // Extract car spaces
      const carsMatch = html.match(/(\d+)\s*(?:car(?:space)?s?|garage|parking)/i);
      if (carsMatch) data.cars = parseInt(carsMatch[1]);

      // Extract land size (various formats: "650m2", "650 sqm", "650 m²")
      const landMatch = html.match(/(\d+(?:,\d+)?)\s*(?:m[²2]|sqm|square\s*metre)/i);
      if (landMatch) data.land_size_sqm = parseInt(landMatch[1].replace(',', ''));

      // Extract property type
      if (html.match(/\bhouse\b/i)) data.property_type = 'house';
      else if (html.match(/\b(?:unit|apartment)\b/i)) data.property_type = 'unit';
      else if (html.match(/\btownhouse\b/i)) data.property_type = 'townhouse';
      else if (html.match(/\bland\b/i)) data.property_type = 'land';

      // Extract price (various formats)
      const priceMatch = html.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?/);
      if (priceMatch) data.price_guide_text = priceMatch[0];

      // Extract address - look for common patterns
      const addressMatch = html.match(/(\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Lane|Ln|Way|Boulevard|Blvd))/i);
      if (addressMatch) data.address_line = addressMatch[1].trim();

      // Extract suburb and postcode
      const suburbPostcodeMatch = html.match(/([A-Za-z\s]+)\s+(?:VIC\s+)?(\d{4})/i);
      if (suburbPostcodeMatch) {
        data.suburb = suburbPostcodeMatch[1].trim();
        data.postcode = suburbPostcodeMatch[2];
      }

      return data;
    };

    const listingData = extractData(html);

    console.log('Extracted listing data:', listingData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: listingData,
        message: 'Property data extracted successfully. Please review and adjust as needed.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scraping listing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape listing';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});