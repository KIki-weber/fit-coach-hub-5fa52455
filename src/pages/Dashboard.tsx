import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { BMICalculator } from "@/components/dashboard/BMICalculator";
import { BMRCalculator } from "@/components/dashboard/BMRCalculator";
import AutoNutritionRecommendations from "@/components/dashboard/AutoNutritionRecommendations";
import { AINutritionRecommendations } from "@/components/dashboard/AINutritionRecommendations";
import { ProgressTracking } from "@/components/dashboard/ProgressTracking";
import { ScheduleView } from "@/components/dashboard/ScheduleView";
import { MessagesView } from "@/components/dashboard/MessagesView";
import { NutritionView } from "@/components/dashboard/NutritionView";
import { EventsView } from "@/components/dashboard/EventsView";
import { BookingView } from "@/components/dashboard/BookingView";
import logoRunner from "@/assets/logo-runner.png";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      } else {
        // Fetch user profile to get gender
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("gender")
      .eq("user_id", userId)
      .single();
    
    if (data?.gender) {
      setGender(data.gender);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
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

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <UserProfile userId={user?.id || ""} />;
      case "progress":
        return <ProgressTracking userId={user?.id || ""} />;
      case "events":
        return <EventsView />;
      case "calculators":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <BMICalculator onCalculate={(value) => setBmi(value)} />
              <BMRCalculator onCalculate={(value) => setBmr(value)} />
            </div>
          </div>
        );
      case "nutrition":
        return (
          <div className="space-y-6">
            <AINutritionRecommendations bmi={bmi} gender={gender} />
            <AutoNutritionRecommendations bmi={bmi} bmr={bmr} />
            <NutritionView />
          </div>
        );
      case "booking":
        return <BookingView userId={user?.id || ""} />;
      case "schedule":
        return <ScheduleView userId={user?.id || ""} />;
      case "messages":
        return <MessagesView userId={user?.id || ""} />;
      default:
        return <UserProfile userId={user?.id || ""} />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "profile": return "My Profile";
      case "progress": return "Progress Tracking";
      case "events": return "Events";
      case "calculators": return "BMI & BMR Calculator";
      case "nutrition": return "AI Nutrition Recommendations";
      case "booking": return "Book with Coach Dave";
      case "schedule": return "My Schedule";
      case "messages": return "Messages";
      default: return "Dashboard";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card px-6 py-4 flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">{getSectionTitle()}</h1>
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

export default Dashboard;
