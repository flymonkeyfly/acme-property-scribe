import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function SuburbsPage() {
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
            <h3 className="text-lg font-semibold mb-2">Suburb Data Coming Soon</h3>
            <p className="text-muted-foreground">
              Cached median prices, POIs, and suburb profiles will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
