import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address_line: "",
    suburb: "",
    postcode: "",
    beds: "",
    baths: "",
    cars: "",
    land_size_sqm: "",
    property_type: "",
    price_guide_text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("listings")
        .insert({
          ...formData,
          beds: formData.beds ? parseInt(formData.beds) : null,
          baths: formData.baths ? parseInt(formData.baths) : null,
          cars: formData.cars ? parseInt(formData.cars) : null,
          land_size_sqm: formData.land_size_sqm ? parseInt(formData.land_size_sqm) : null,
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Listing created successfully!");
      navigate(`/listings/${data.id}`);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/listings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listings
          </Button>
        </Link>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Create New Listing</CardTitle>
            <CardDescription>
              Enter property details to begin enrichment process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line">Street Address *</Label>
                  <Input
                    id="address_line"
                    placeholder="123 Bay Road"
                    value={formData.address_line}
                    onChange={(e) => updateField("address_line", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input
                      id="suburb"
                      placeholder="Mount Martha"
                      value={formData.suburb}
                      onChange={(e) => updateField("suburb", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="3934"
                      value={formData.postcode}
                      onChange={(e) => updateField("postcode", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beds">Beds</Label>
                    <Input
                      id="beds"
                      type="number"
                      placeholder="3"
                      value={formData.beds}
                      onChange={(e) => updateField("beds", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baths">Baths</Label>
                    <Input
                      id="baths"
                      type="number"
                      placeholder="2"
                      value={formData.baths}
                      onChange={(e) => updateField("baths", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cars">Cars</Label>
                    <Input
                      id="cars"
                      type="number"
                      placeholder="2"
                      value={formData.cars}
                      onChange={(e) => updateField("cars", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select value={formData.property_type} onValueChange={(v) => updateField("property_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="unit">Unit/Apartment</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="land_size_sqm">Land Size (m²)</Label>
                  <Input
                    id="land_size_sqm"
                    type="number"
                    placeholder="650"
                    value={formData.land_size_sqm}
                    onChange={(e) => updateField("land_size_sqm", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_guide_text">Price Guide</Label>
                  <Input
                    id="price_guide_text"
                    placeholder="$1,200,000 - $1,300,000"
                    value={formData.price_guide_text}
                    onChange={(e) => updateField("price_guide_text", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Listing"}
                </Button>
                <Link to="/listings" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
