import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Users, Calendar, TrendingUp, Apple, Dumbbell, MessageSquare, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-fitness.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  content: string;
  event_date: string | null;
  event_time: string | null;
  image_url: string | null;
  created_at: string;
}


const Index = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [active, setActive] = useState<EventItem | null>(null);
  useEffect(() => {
    supabase.from("events").select("*").order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => { if (data) setEvents(data as any); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />


      {/* Hero — Neon Volt */}
      <section
        className="relative min-h-[88vh] md:min-h-[92vh] flex items-center justify-center px-4 overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/75 to-background/40 dark:from-background/95 dark:via-background/85 dark:to-background/60" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="container mx-auto relative z-10 text-center space-y-6 md:space-y-8 pt-20 md:pt-16 px-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">Neon Volt Energy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
            Train with Purpose.
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent text-glow">
              Live with Power.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/80 max-w-3xl mx-auto px-2">
            OneLove Fitness — personalized coaching, smart nutrition, and high-voltage training plans built around you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link to="/auth?tab=signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-primary shadow-glow text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-semibold">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-background/50 backdrop-blur-sm border-primary/40 hover:bg-primary/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            Why Choose <span className="text-primary">OneLove Fitness</span>?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="shadow-card hover:shadow-smooth transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Expert Coaches</h3>
                <p className="text-muted-foreground">
                  Work with certified trainers who understand your goals
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-smooth transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Custom Schedules</h3>
                <p className="text-muted-foreground">
                  Get personalized training schedules tailored to you
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-smooth transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your BMI, BMR, and fitness metrics
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-smooth transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">See Results</h3>
                <p className="text-muted-foreground">
                  Achieve your fitness goals with proven methods
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-10 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Our Wellness Services
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Comprehensive health and fitness solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="shadow-card hover:shadow-smooth transition-all duration-300">
              <CardContent className="pt-6 space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-center">Personal Training</h3>
                <p className="text-muted-foreground text-center">
                  One-on-one coaching sessions with certified trainers. Get customized workout plans designed for your fitness level and goals.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Personalized exercise routines</li>
                  <li>✓ Form correction and technique guidance</li>
                  <li>✓ Progress tracking and adjustments</li>
                  <li>✓ Flexible scheduling options</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-smooth transition-all duration-300">
              <CardContent className="pt-6 space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Apple className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-center">Nutrition Planning</h3>
                <p className="text-muted-foreground text-center">
                  Custom meal plans based on your BMI, BMR, and fitness goals. Learn to fuel your body properly for optimal results.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Personalized macronutrient targets</li>
                  <li>✓ Meal suggestions and recipes</li>
                  <li>✓ Supplement recommendations</li>
                  <li>✓ Regular nutritional adjustments</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-smooth transition-all duration-300">
              <CardContent className="pt-6 space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-center">24/7 Support</h3>
                <p className="text-muted-foreground text-center">
                  Direct messaging with your coach anytime. Get answers to questions, motivation, and guidance whenever you need it.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Real-time chat with trainers</li>
                  <li>✓ Health tips and wellness advice</li>
                  <li>✓ Schedule management tools</li>
                  <li>✓ Event and workshop notifications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Section - posts from Coach Dave */}
      {events.length > 0 && (
        <section className="py-10 md:py-16 px-4 bg-secondary/20">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Upcoming Events</h2>
              <p className="text-base md:text-lg text-muted-foreground">Latest events from Coach Dave</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setActive(ev)}
                  className="group text-left rounded-2xl bg-card border border-border hover:border-primary/50 shadow-card hover:shadow-glow transition-all overflow-hidden"
                >
                  {ev.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      {ev.event_date && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-glow">
                          {new Date(ev.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-primary" />
                  )}
                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
                    )}
                    <p className="text-sm text-foreground/80 line-clamp-2">{ev.content}</p>
                    <div className="inline-flex items-center gap-1 text-sm text-primary font-semibold pt-1">
                      View details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">{active?.title}</DialogTitle>
            {active?.description && <DialogDescription>{active.description}</DialogDescription>}
          </DialogHeader>
          {active?.image_url && (
            <img src={active.image_url} alt={active.title} className="w-full max-h-[380px] object-cover rounded-lg" />
          )}
          {(active?.event_date || active?.event_time) && (
            <div className="flex flex-wrap gap-2 text-sm">
              {active?.event_date && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary font-medium">
                  <Calendar className="w-4 h-4" /> {new Date(active.event_date).toLocaleDateString()}
                </span>
              )}
              {active?.event_time && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent font-medium">
                  {active.event_time}
                </span>
              )}
            </div>
          )}
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{active?.content}</p>
        </DialogContent>
      </Dialog>


      <section className="py-10 md:py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto px-2">
            Join thousands of people transforming their lives with OneLove Fitness coaching
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-smooth font-semibold">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm md:text-base">
          <p>© 2026 OneLove Fitness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
