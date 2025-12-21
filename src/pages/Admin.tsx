import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoRunner from "@/assets/logo-runner.png";
import { AdminUserList } from "@/components/admin/AdminUserList";
import { AdminScheduleManager } from "@/components/admin/AdminScheduleManager";
import { AdminMessageSender } from "@/components/admin/AdminMessageSender";
import { AdminNutritionManager } from "@/components/admin/AdminNutritionManager";
import { AdminEventManager } from "@/components/admin/AdminEventManager";
import { AdminStatsOverview } from "@/components/admin/AdminStatsOverview";
import { AdminBookingManager } from "@/components/admin/AdminBookingManager";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [newUserCount, setNewUserCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Real-time subscription for new user notifications
  useEffect(() => {
    if (!isAdmin) return;

    // Set initial check time
    const now = new Date();
    setLastCheckedTime(now);

    // Subscribe to new profiles
    const channel = supabase
      .channel('new-users')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          setNewUserCount(prev => prev + 1);
          toast({
            title: "New User Registered!",
            description: `A new user has just signed up.`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, toast]);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (roles) {
      setIsAdmin(true);
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (section === "users") {
      setNewUserCount(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={logoRunner} alt="VitalityHub" className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminStatsOverview />;
      case "users":
        return <AdminUserList />;
      case "bookings":
        return <AdminBookingManager />;
      case "events":
        return <AdminEventManager />;
      case "schedules":
        return <AdminScheduleManager />;
      case "nutrition":
        return <AdminNutritionManager />;
      case "messages":
        return <AdminMessageSender />;
      default:
        return <AdminStatsOverview />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview": return "Dashboard Overview";
      case "users": return "Registered Users";
      case "bookings": return "Booking Requests";
      case "events": return "Event Management";
      case "schedules": return "Schedule Management";
      case "nutrition": return "Nutrition Plans";
      case "messages": return "Send Messages";
      default: return "Admin Panel";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
          newUserCount={newUserCount}
        />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card px-6 py-4 flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold flex-1">{getSectionTitle()}</h1>
            {newUserCount > 0 && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">{newUserCount} new user(s)</span>
              </div>
            )}
          </header>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
