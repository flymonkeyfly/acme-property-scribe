import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, DollarSign, TrendingUp, Star, ShoppingBag, Utensils, Waves, Trees, Bus, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SuburbMap } from "@/components/SuburbMap";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PENINSULA_SUBURBS = ['Sorrento', 'Blairgowrie', 'Rye', 'Portsea'];

export default function SuburbsPage() {
  const [suburbs, setSuburbs] = useState<any[]>([]);
  const [selectedSuburb, setSelectedSuburb] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuburbs();
  }, []);

  const loadSuburbs = async () => {
    try {
      const { data, error } = await supabase
        .from('suburbs')
        .select('*')
        .in('name', PENINSULA_SUBURBS)
        .order('name');

      if (error) throw error;
      
      setSuburbs(data || []);
      if (data && data.length > 0) {
        setSelectedSuburb(data[0]);
      }
    } catch (error) {
      console.error('Error loading suburbs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading suburb data...</p>
        </div>
      </MainLayout>
    );
  }

  if (!selectedSuburb) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Suburb Explorer</h1>
            <p className="text-muted-foreground mt-1">
              Market intelligence for Mornington Peninsula
            </p>
          </div>
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Suburb Data</h3>
              <p className="text-muted-foreground">
                No suburb profiles available yet
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const stats = selectedSuburb.stats_json;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{selectedSuburb.name}</h1>
            <p className="text-muted-foreground mt-1">
              {selectedSuburb.lga} • Comprehensive suburb profile
            </p>
          </div>
          {suburbs.length > 1 && (
            <div className="w-[200px]">
              <Select 
                value={selectedSuburb.name}
                onValueChange={(name) => {
                  const suburb = suburbs.find(s => s.name === name);
                  setSelectedSuburb(suburb);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select suburb" />
                </SelectTrigger>
                <SelectContent>
                  {suburbs.map(suburb => (
                    <SelectItem key={suburb.name} value={suburb.name}>
                      {suburb.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Map */}
        {stats?.coordinates && (
          <SuburbMap 
            latitude={stats.coordinates.lat}
            longitude={stats.coordinates.lng}
            suburbName={selectedSuburb.name}
          />
        )}

        {/* Key Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Population</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.population?.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Median House Price</p>
                  <p className="text-2xl font-bold text-foreground">${(stats?.median_house_price / 1000000).toFixed(2)}M</p>
                </div>
                <Home className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Median Income</p>
                  <p className="text-2xl font-bold text-foreground">${(stats?.median_household_income / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rental Yield</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.rental_yield}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
            <CardDescription>Community composition and characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Median Age</span>
                  <span className="font-semibold">{stats?.median_age} years</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Owner Occupied</span>
                  <span className="font-semibold">{stats?.owner_occupied}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Crime Rate</span>
                  <Badge variant="secondary">{stats?.crime_rate}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Schools Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{stats?.schools_rating}/5</span>
                  </div>
                </div>
              </div>

              {stats?.demographics && (
                <div>
                  <h4 className="font-semibold mb-3">Household Composition</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Families</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${stats.demographics.families}%` }} />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{stats.demographics.families}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Retirees</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${stats.demographics.retirees}%` }} />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{stats.demographics.retirees}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Professionals</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${stats.demographics.professionals}%` }} />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{stats.demographics.professionals}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attractions */}
        {stats?.attractions?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attractions & Points of Interest</CardTitle>
              <CardDescription>What makes this suburb special</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {stats.attractions.map((attraction: any, i: number) => (
                  <div key={i} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {attraction.type === 'Beach' && <Waves className="h-5 w-5 text-blue-500" />}
                        {attraction.type === 'National Park' && <Trees className="h-5 w-5 text-green-500" />}
                        {attraction.type === 'Marina' && <Waves className="h-5 w-5 text-cyan-500" />}
                        {!['Beach', 'National Park', 'Marina'].includes(attraction.type) && <MapPin className="h-5 w-5 text-purple-500" />}
                        <h4 className="font-semibold">{attraction.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{attraction.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{attraction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{attraction.type}</Badge>
                      <span>• {attraction.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shopping */}
        {stats?.shopping?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Shopping & Dining</CardTitle>
              <CardDescription>Local shopping precincts and facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.shopping.map((shop: any, i: number) => (
                  <div key={i} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">{shop.name}</h4>
                      <Badge variant="outline">{shop.distance}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shop.facilities.map((facility: string, j: number) => (
                        <Badge key={j} variant="secondary">{facility}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lifestyle */}
        {stats?.lifestyle && (
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle & Amenities</CardTitle>
              <CardDescription>Everything you need for daily living</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Waves className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Beach Access</div>
                      <div className="text-sm text-muted-foreground">{stats.lifestyle.beach_access}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Utensils className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Cafes & Restaurants</div>
                      <div className="text-sm text-muted-foreground">{stats.lifestyle.cafes_restaurants} venues</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Trees className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Parks & Recreation</div>
                      <div className="text-sm text-muted-foreground">{stats.lifestyle.parks} parks</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Sporting Facilities</div>
                    <div className="flex flex-wrap gap-2">
                      {stats.lifestyle.sporting_facilities?.map((sport: string, i: number) => (
                        <Badge key={i} variant="secondary">{sport}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Medical Facilities</div>
                    <div className="flex flex-wrap gap-2">
                      {stats.lifestyle.medical_facilities?.map((facility: string, i: number) => (
                        <Badge key={i} variant="secondary">{facility}</Badge>
                      ))}
                    </div>
                  </div>
                  {stats.lifestyle.community && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-foreground italic">{stats.lifestyle.community}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transport */}
        {stats?.transport && (
          <Card>
            <CardHeader>
              <CardTitle>Transport & Connectivity</CardTitle>
              <CardDescription>Getting around and commuting options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">Public Transport</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bus Routes: </span>
                      <span className="font-medium">{stats.transport.bus_routes?.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nearest Train: </span>
                      <span className="font-medium">{stats.transport.nearest_train}</span>
                    </div>
                    {stats.transport.ferry_access && (
                      <div>
                        <span className="text-muted-foreground">Ferry: </span>
                        <span className="font-medium">{stats.transport.ferry_access}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <h4 className="font-semibold">Drive Times</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Melbourne CBD: </span>
                      <span className="font-medium">{stats.transport.drive_to_melbourne_cbd}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
