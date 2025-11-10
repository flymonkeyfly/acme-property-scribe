import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, LayoutDashboard, FolderOpen, MapPin, Users, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Listings", href: "/listings", icon: FolderOpen },
    { name: "Suburbs", href: "/suburbs", icon: MapPin },
    { name: "Leads", href: "/leads", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Bev's Little Helper</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <Link key={item.name} to={item.href}>
                    <Button variant="ghost" className="gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
