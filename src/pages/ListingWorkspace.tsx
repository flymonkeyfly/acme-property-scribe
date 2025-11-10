import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialAssetsTab } from "@/components/SocialAssetsTab";
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
      
      let { lat, lng } = listing;
      
      // Call geocode if coordinates missing
      if (lat == null || lng == null) {
        const { data: geocodeResult } = await supabase.functions.invoke("geocode", {
          body: { address: fullAddress }
        });

        if (!geocodeResult?.ok) {
          throw new Error("Geocoding failed");
        }

        lat = geocodeResult.data.lat;
        lng = geocodeResult.data.lng;

        // Update listing with coordinates
        await supabase
          .from("listings")
          .update({ lat, lng })
          .eq("id", id);
      }

      // Call enrichment functions in parallel
      const [schoolsRes, planningRes, heritageRes, ptvRes, poisARes, poisBRes, mediansRes] = await Promise.all([
        supabase.functions.invoke("schools_nearby", { body: { lat, lng, address: fullAddress }}),
        supabase.functions.invoke("vicplan_overlays", { body: { lat, lng }}),
        supabase.functions.invoke("heritage_lookup", { body: { lat, lng }}),
        supabase.functions.invoke("ptv_nearest", { body: { lat, lng }}),
        supabase.functions.invoke("places_nearby", { 
          body: { lat, lng, types: ["cafe", "restaurant"], radius_m: 800 }
        }),
        supabase.functions.invoke("places_nearby", { 
          body: { lat, lng, types: ["supermarket", "park", "beach"], radius_m: 1200 }
        }),
        supabase.functions.invoke("vgv_medians", { body: { suburb: listing.suburb }})
      ]);

      // Merge POIs from both calls
      const mergedPois = {
        places: [
          ...(poisARes.data?.data?.places || []),
          ...(poisBRes.data?.data?.places || [])
        ]
      };

      // Save enrichment
      const enrichmentData = {
        listing_id: id,
        schools_json: schoolsRes.data?.data || {},
        planning_overlays_json: planningRes.data?.data || {},
        heritage_json: heritageRes.data?.data || {},
        ptv_json: ptvRes.data?.data || {},
        pois_json: mergedPois,
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
            {enriching ? (
              <div className="text-sm text-muted-foreground">Fetching local facts…</div>
            ) : enrichment ? (
              <div className="space-y-8">
                {/* Nearby Schools */}
                <section>
                  <h3 className="font-semibold mb-3 text-foreground">Nearby Schools</h3>
                  {enrichment.schools_json?.top3?.length ? (
                    <ul className="space-y-2">
                      {enrichment.schools_json.top3.map((school: any, i: number) => (
                        <li key={i} className="text-sm text-foreground">
                          <span className="font-medium">{school.name}</span>
                          {school.sector && <> · {school.sector}</>}
                          {school.level && <> · {school.level}</>}
                          {school.distance_m != null && <> · {school.distance_m < 1000 ? `${school.distance_m} m` : `${(school.distance_m / 1000).toFixed(1)} km`}</>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No nearby schools found yet.</p>
                  )}
                  {enrichment.schools_json?.find_my_school_url && (
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <a href={enrichment.schools_json.find_my_school_url} target="_blank" rel="noopener noreferrer">
                        Check official zones
                      </a>
                    </Button>
                  )}
                </section>

                {/* Planning & Overlays */}
                <section>
                  <h3 className="font-semibold mb-3 text-foreground">Planning & Overlays</h3>
                  {enrichment.planning_overlays_json?.overlays?.length ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {enrichment.planning_overlays_json.overlays.map((overlay: any, i: number) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
                          {overlay.code || overlay.name || "Overlay"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">
                      No overlays parsed — verify in VicPlan.
                    </p>
                  )}
                  {enrichment.planning_overlays_json?.verify_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={enrichment.planning_overlays_json.verify_link} target="_blank" rel="noopener noreferrer">
                        Verify in VicPlan
                      </a>
                    </Button>
                  )}
                </section>

                {/* Heritage */}
                <section>
                  <h3 className="font-semibold mb-3 text-foreground">Heritage</h3>
                  {enrichment.heritage_json?.records?.length ? (
                    <ul className="space-y-1 mb-3">
                      {enrichment.heritage_json.records.map((record: any, i: number) => (
                        <li key={i} className="text-sm text-foreground">
                          {record.name || "Heritage place"}
                          {record.distance_m != null && <> · {record.distance_m < 1000 ? `${record.distance_m} m` : `${(record.distance_m / 1000).toFixed(1)} km`}</>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">
                      No state heritage records found in search radius — check council / official database.
                    </p>
                  )}
                  {enrichment.heritage_json?.verify_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={enrichment.heritage_json.verify_link} target="_blank" rel="noopener noreferrer">
                        Check Victorian Heritage Database
                      </a>
                    </Button>
                  )}
                </section>

                {/* Transport */}
                <section>
                  <h3 className="font-semibold mb-3 text-foreground">Transport</h3>
                  {enrichment.ptv_json?.nearest?.length ? (
                    <ul className="space-y-1 mb-3">
                      {enrichment.ptv_json.nearest.map((stop: any, i: number) => (
                        <li key={i} className="text-sm text-foreground">
                          {stop.stop_name || stop.name || "Nearby stop"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">No stops loaded — check PTV.</p>
                  )}
                  {enrichment.ptv_json?.verify_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={enrichment.ptv_json.verify_link} target="_blank" rel="noopener noreferrer">
                        View on PTV
                      </a>
                    </Button>
                  )}
                </section>

                {/* Lifestyle */}
                <section>
                  <h3 className="font-semibold mb-3 text-foreground">Lifestyle</h3>
                  {enrichment.pois_json?.places?.length ? (
                    <ul className="space-y-1">
                      {enrichment.pois_json.places.map((poi: any, i: number) => (
                        <li key={i} className="text-sm text-foreground">
                          {poi.type ? `${poi.type.charAt(0).toUpperCase()}${poi.type.slice(1)}` : "Place"}
                          {" — "}
                          {poi.displayName?.text || poi.name || "Nearby"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No nearby places loaded yet.</p>
                  )}
                </section>
              </div>
            ) : (
              <p className="text-muted-foreground">Enrich listing to view facts</p>
            )}
          </TabsContent>

          <TabsContent value="market">
            <p className="text-muted-foreground">Market data will appear here after enrichment</p>
          </TabsContent>

          <TabsContent value="assets">
            {listing && (
              <SocialAssetsTab
                listingId={listing.id}
                listingData={{
                  address_line: listing.address_line,
                  suburb: listing.suburb,
                  beds: listing.beds || 0,
                  baths: listing.baths || 0,
                  land_size_sqm: listing.land_size_sqm || 0
                }}
                enrichmentData={enrichment}
              />
            )}
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
