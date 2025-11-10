import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Plus, Calendar, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";

export default function Dashboard() {
  const [stats, setStats] = useState({
    active: 0,
    draft: 0,
    leads: 0,
    opens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: listings } = await supabase
        .from("listings")
        .select("id, status")
        .eq("created_by", user.id);

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      setStats({
        active: listings?.filter(l => l.status === "active").length || 0,
        draft: listings?.filter(l => l.status === "draft").length || 0,
        leads: leadsCount || 0,
        opens: 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Active Listings",
      value: stats.active,
      icon: Building2,
      description: "Currently listed properties",
      color: "text-primary",
    },
    {
      title: "Draft Listings",
      value: stats.draft,
      icon: TrendingUp,
      description: "Pending enrichment & review",
      color: "text-secondary",
    },
    {
      title: "Total Leads",
      value: stats.leads,
      icon: Users,
      description: "Enquiries this month",
      color: "text-accent",
    },
    {
      title: "Opens This Week",
      value: stats.opens,
      icon: Calendar,
      description: "Scheduled inspections",
      color: "text-success",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Mornington Peninsula listing intelligence
            </p>
          </div>
          <Link to="/listings/new">
            <Button size="lg" className="shadow-medium">
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {loading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Common tasks to get your listing market-ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/listings/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create new listing
              </Button>
            </Link>
            <Link to="/listings">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                View all listings
              </Button>
            </Link>
            <Link to="/suburbs">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Explore suburbs
              </Button>
            </Link>
            <Link to="/leads">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Review leads
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
