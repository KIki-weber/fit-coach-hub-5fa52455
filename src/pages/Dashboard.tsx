import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { BMICalculator } from "@/components/dashboard/BMICalculator";
import { BMRCalculator } from "@/components/dashboard/BMRCalculator";
import { ScheduleView } from "@/components/dashboard/ScheduleView";
import { MessagesView } from "@/components/dashboard/MessagesView";
import { NutritionView } from "@/components/dashboard/NutritionView";
import { EventsView } from "@/components/dashboard/EventsView";
import logoRunner from "@/assets/logo-runner.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoRunner} alt="VitalityHub" className="w-6 h-6" />
            <span className="text-xl font-bold">VitalityHub</span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome to Your Dashboard
        </h1>

        <div className="grid gap-6">
          {/* Profile Section */}
          <UserProfile userId={user?.id || ""} />

          {/* Events */}
          <EventsView />

          {/* Calculators */}
          <div className="grid md:grid-cols-2 gap-6">
            <BMICalculator />
            <BMRCalculator />
          </div>

          {/* Schedules, Nutrition and Messages */}
          <ScheduleView userId={user?.id || ""} />
          <NutritionView />
          <MessagesView userId={user?.id || ""} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
