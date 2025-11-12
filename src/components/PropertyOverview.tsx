import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PropertyOverviewProps {
  listing: {
    id: string;
    address_line: string;
    suburb: string;
    state: string;
    postcode: string;
    beds: number | null;
    baths: number | null;
    cars: number | null;
    land_size_sqm: number | null;
    property_type: string | null;
    price_guide_text: string | null;
    lat: number | null;
    lng: number | null;
    created_at: string;
  };
  enrichment?: any;
}

export function PropertyOverview({ listing, enrichment }: PropertyOverviewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCheatSheet = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate_agent_cheatsheet', {
        body: {
          listing,
          enrichment
        }
      });

      if (error) {
        toast.error('Failed to generate cheat sheet');
        return;
      }

      if (data.pdfUrl) {
        // Open in new tab or download
        window.open(data.pdfUrl, '_blank');
        toast.success('Cheat sheet downloaded!');
      } else if (data.html) {
        // If we get HTML, open it in a new window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          toast.success('Cheat sheet opened! Use browser Print to save as PDF.');
        }
      }
    } catch (error) {
      console.error('Error generating cheat sheet:', error);
      toast.error('Failed to generate cheat sheet');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Property Overview</h2>
          <p className="text-muted-foreground">Comprehensive property details and location information</p>
        </div>
        <Button 
          onClick={handleDownloadCheatSheet} 
          disabled={downloading}
          size="lg"
          className="shadow-md"
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Agent Cheat Sheet
            </>
          )}
        </Button>
      </div>

      {/* Key Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Key Statistics</CardTitle>
          <CardDescription>Property specifications at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {listing.beds && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-foreground">{listing.beds}</div>
                <div className="text-sm text-muted-foreground mt-1">Bedrooms</div>
              </div>
            )}
            {listing.baths && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-foreground">{listing.baths}</div>
                <div className="text-sm text-muted-foreground mt-1">Bathrooms</div>
              </div>
            )}
            {listing.cars && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-foreground">{listing.cars}</div>
                <div className="text-sm text-muted-foreground mt-1">Car Spaces</div>
              </div>
            )}
            {listing.land_size_sqm && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-foreground">{listing.land_size_sqm}</div>
                <div className="text-sm text-muted-foreground mt-1">Land Size (sqm)</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="font-medium text-foreground">{listing.address_line}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Suburb</div>
              <div className="font-medium text-foreground">{listing.suburb}, {listing.state} {listing.postcode}</div>
            </div>
            {listing.property_type && (
              <div>
                <div className="text-sm text-muted-foreground">Property Type</div>
                <div className="font-medium text-foreground capitalize">{listing.property_type}</div>
              </div>
            )}
            {listing.price_guide_text && (
              <div>
                <div className="text-sm text-muted-foreground">Price Guide</div>
                <div className="font-medium text-foreground">${parseInt(listing.price_guide_text).toLocaleString()}</div>
              </div>
            )}
            {listing.lat && listing.lng && (
              <div>
                <div className="text-sm text-muted-foreground">Coordinates</div>
                <div className="font-medium text-foreground text-xs">{listing.lat.toFixed(6)}, {listing.lng.toFixed(6)}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location & Amenities */}
      {enrichment && (
        <>
          {/* Schools */}
          {enrichment.schools_json?.top3?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nearby Schools</CardTitle>
                <CardDescription>Quality education within reach</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrichment.schools_json.top3.map((school: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">{school.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {school.sector && <span>{school.sector}</span>}
                          {school.level && <span> • {school.level}</span>}
                        </div>
                      </div>
                      {school.distance_m != null && (
                        <div className="text-sm font-medium text-foreground">
                          {school.distance_m < 1000 
                            ? `${school.distance_m}m` 
                            : `${(school.distance_m / 1000).toFixed(1)}km`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transport */}
          {enrichment.ptv_json?.nearest?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Public Transport</CardTitle>
                <CardDescription>Live timetable - next departures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrichment.ptv_json.nearest.map((stop: any, i: number) => (
                    <div key={i} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">
                          {stop.route_type === 0 && '🚊'}
                          {stop.route_type === 1 && '🚋'}
                          {stop.route_type === 2 && '🚌'}
                          {stop.route_type === 3 && '🚆'}
                          {![0, 1, 2, 3].includes(stop.route_type) && '🚌'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{stop.stop_name}</div>
                          {stop.stop_suburb && (
                            <div className="text-sm text-muted-foreground">{stop.stop_suburb}</div>
                          )}
                        </div>
                        {stop.distance_m != null && (
                          <div className="text-sm font-medium text-foreground">{stop.distance_m}m</div>
                        )}
                      </div>
                      
                      {stop.departures && stop.departures.length > 0 && (
                        <div className="space-y-2 ml-11">
                          {stop.departures.map((dep: any, depIdx: number) => {
                            const departureTime = new Date(dep.estimated_time);
                            const timeUntil = formatDistanceToNow(departureTime, { addSuffix: true });
                            const formattedTime = departureTime.toLocaleTimeString('en-AU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            });
                            
                            return (
                              <div key={depIdx} className="flex justify-between items-center py-2 px-3 bg-background rounded">
                                <div className="text-sm text-foreground">
                                  {formattedTime}
                                </div>
                                <div className="text-sm font-medium text-primary">
                                  {timeUntil.replace('in ', '')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {(!stop.departures || stop.departures.length === 0) && (
                        <div className="text-sm text-muted-foreground ml-11">
                          No upcoming departures
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lifestyle & POIs */}
          {enrichment.pois_json?.places?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle & Amenities</CardTitle>
                <CardDescription>Everything you need nearby</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {enrichment.pois_json.places.map((poi: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="text-xl">
                        {poi.type === 'park' && '🏞️'}
                        {poi.type === 'cafe' && '☕'}
                        {poi.type === 'restaurant' && '🍽️'}
                        {poi.type === 'shopping' && '🛍️'}
                        {!['park', 'cafe', 'restaurant', 'shopping'].includes(poi.type) && '📍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {poi.displayName?.text || poi.name || 'Nearby place'}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">{poi.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Data */}
          {enrichment.suburb_medians_json?.house?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
                <CardDescription>Recent sales data for {enrichment.suburb_medians_json.suburb}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrichment.suburb_medians_json.house.slice(0, 3).map((data: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">{data.year}</div>
                      <div className="font-medium text-foreground">
                        ${parseInt(data.median_price).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">{data.sales_count} sales</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sales History */}
          {enrichment.disclaimers_json?.sales_history?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>Previous sales of this property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrichment.disclaimers_json.sales_history.map((sale: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">
                          ${parseInt(sale.price).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(sale.date).toLocaleDateString('en-AU', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        {sale.agent && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Sold by {sale.agent}
                          </div>
                        )}
                      </div>
                      {sale.increase_from_previous > 0 && (
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            sale.increase_from_previous > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {sale.increase_from_previous > 0 ? '+' : ''}
                            {sale.increase_from_previous.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">vs previous</div>
                        </div>
                      )}
                      {i === 0 && (
                        <div className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Most Recent
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Appreciation Since 1987
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    4,860%
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    From $51,000 to $2,530,000
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Enrichment Message */}
      {!enrichment && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No enrichment data available</p>
            <p className="text-sm text-muted-foreground">
              Enrich this listing to see detailed location information
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
