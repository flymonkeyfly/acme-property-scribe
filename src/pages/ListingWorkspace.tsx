import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ListingWorkspace() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [enrichment, setEnrichment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    if (id) loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (listingError) throw listingError;
      setListing(listingData);

      const { data: enrichData } = await supabase
        .from("enrichment")
        .select("*")
        .eq("listing_id", id)
        .single();

      if (enrichData) setEnrichment(enrichData);
    } catch (error: any) {
      console.error("Error loading listing:", error);
      toast.error(error.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrich = async () => {
    if (!listing) return;
    setEnriching(true);

    try {
      const fullAddress = `${listing.address_line}, ${listing.suburb} ${listing.state} ${listing.postcode}`;
      
      // Call geocode
      const { data: geocodeResult } = await supabase.functions.invoke("geocode", {
        body: { address: fullAddress }
      });

      if (!geocodeResult?.ok) {
        throw new Error("Geocoding failed");
      }

      const { lat, lng } = geocodeResult.data;

      // Update listing with coordinates
      await supabase
        .from("listings")
        .update({ lat, lng })
        .eq("id", id);

      // Call enrichment functions in parallel
      const [schoolsRes, planningRes, heritageRes, ptvRes, poisRes, mediansRes] = await Promise.all([
        supabase.functions.invoke("schools_nearby", { body: { lat, lng, address: fullAddress }}),
        supabase.functions.invoke("vicplan_overlays", { body: { lat, lng }}),
        supabase.functions.invoke("heritage_lookup", { body: { lat, lng }}),
        supabase.functions.invoke("ptv_nearest", { body: { lat, lng }}),
        supabase.functions.invoke("places_nearby", { 
          body: { lat, lng, types: ["cafe", "restaurant", "supermarket", "park", "beach"] }
        }),
        supabase.functions.invoke("vgv_medians", { body: { suburb: listing.suburb }})
      ]);

      // Save enrichment
      const enrichmentData = {
        listing_id: id,
        schools_json: schoolsRes.data?.data || {},
        planning_overlays_json: planningRes.data?.data || {},
        heritage_json: heritageRes.data?.data || {},
        ptv_json: ptvRes.data?.data || {},
        pois_json: poisRes.data?.data || {},
        suburb_medians_json: mediansRes.data?.data || {},
        generated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("enrichment")
        .upsert(enrichmentData);

      if (error) throw error;

      setEnrichment(enrichmentData);
      toast.success("Listing enriched successfully!");
    } catch (error: any) {
      console.error("Enrichment error:", error);
      toast.error(error.message || "Enrichment failed");
    } finally {
      setEnriching(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </MainLayout>
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Listing not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/listings">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to listings
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {listing.address_line}
            </h1>
            <p className="text-muted-foreground mt-1">
              {listing.suburb} {listing.postcode}
            </p>
          </div>
          {!enrichment && (
            <Button size="lg" onClick={handleEnrich} disabled={enriching} className="shadow-medium">
              <Sparkles className="mr-2 h-4 w-4" />
              {enriching ? "Enriching..." : "Enrich Listing"}
            </Button>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="facts">Facts</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.beds && <div className="p-4 bg-muted rounded-lg"><span className="text-2xl font-bold">{listing.beds}</span><p className="text-sm text-muted-foreground">Beds</p></div>}
                {listing.baths && <div className="p-4 bg-muted rounded-lg"><span className="text-2xl font-bold">{listing.baths}</span><p className="text-sm text-muted-foreground">Baths</p></div>}
                {listing.cars && <div className="p-4 bg-muted rounded-lg"><span className="text-2xl font-bold">{listing.cars}</span><p className="text-sm text-muted-foreground">Cars</p></div>}
                {listing.land_size_sqm && <div className="p-4 bg-muted rounded-lg"><span className="text-2xl font-bold">{listing.land_size_sqm}</span><p className="text-sm text-muted-foreground">m²</p></div>}
              </div>
              {!enrichment && (
                <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                  <p className="text-muted-foreground mb-4">No enrichment data yet</p>
                  <Button onClick={handleEnrich} disabled={enriching}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {enriching ? "Enriching..." : "Enrich Now"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="facts">
            {enrichment ? (
              <div className="space-y-6">
                {enrichment.schools_json?.top3 && (
                  <div>
                    <h3 className="font-semibold mb-2">Nearby Schools</h3>
                    <ul className="space-y-2">
                      {enrichment.schools_json.top3.map((school: any, i: number) => (
                        <li key={i} className="p-3 bg-muted rounded">
                          <div className="font-medium">{school.name}</div>
                          <div className="text-sm text-muted-foreground">{school.sector} · {school.level} · ~{school.distance_m}m</div>
                        </li>
                      ))}
                    </ul>
                    {enrichment.schools_json.find_my_school_url && (
                      <Button variant="outline" size="sm" className="mt-3" asChild>
                        <a href={enrichment.schools_json.find_my_school_url} target="_blank" rel="noopener noreferrer">
                          Check official zones
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Enrich listing to view facts</p>
            )}
          </TabsContent>

          <TabsContent value="market">
            <p className="text-muted-foreground">Market data will appear here after enrichment</p>
          </TabsContent>

          <TabsContent value="assets">
            <p className="text-muted-foreground">AI-generated assets will appear here</p>
          </TabsContent>

          <TabsContent value="compliance">
            <p className="text-muted-foreground">Compliance checks will appear here</p>
          </TabsContent>

          <TabsContent value="leads">
            <p className="text-muted-foreground">Lead management coming soon</p>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
