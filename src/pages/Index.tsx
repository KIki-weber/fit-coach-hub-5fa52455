import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Activity, Users, Calendar, TrendingUp, Apple, Dumbbell, MessageSquare, Zap, ArrowRight,
  Award, Target, Heart, Flame, Salad, Beef, Fish, Egg, Milk, Wheat, Leaf,
  Mail, Phone, MapPin, MessageCircle, Clock,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import heroImage1 from "@/assets/enhanced_hero_fitness (1).jpg";
import heroImage2 from "@/assets/hero-fitness4.jpg";
import heroImage3 from "@/assets/hero-fitness2.jpg";
import heroImage4 from "@/assets/enhanced_hero_fitness3 (1).jpg";
import dawitPhoto from "@/assets/photo_2_2026-04-30_06-10-42.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { TrainersSection } from "@/components/landing/TrainersSection";

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

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

const nutritionPlans = [
  { title: "Weight Loss Plan", description: "Calorie-deficit meals to shed pounds while keeping muscle.", icon: Salad, features: ["Low-calorie meals", "High protein", "Fiber-rich foods", "Portion control"], color: "from-green-500 to-emerald-600" },
  { title: "Muscle Building Plan", description: "High-protein nutrition for growth and recovery.", icon: Beef, features: ["High protein", "Complex carbs", "Post-workout fuel", "Calorie surplus"], color: "from-red-500 to-rose-600" },
  { title: "Balanced Diet Plan", description: "Well-rounded nutrition for sustained energy.", icon: Apple, features: ["Balanced macros", "Variety", "Sustainable", "Micronutrients"], color: "from-orange-500 to-amber-600" },
  { title: "Vegetarian Plan", description: "Plant-based nutrition meeting all dietary needs.", icon: Leaf, features: ["Plant proteins", "Iron-rich foods", "B12 support", "Complete amino acids"], color: "from-teal-500 to-cyan-600" },
];

const foodCategories = [
  { name: "Proteins", icon: Egg, foods: ["Chicken breast", "Salmon", "Eggs", "Greek yogurt", "Tofu"], color: "bg-red-100 dark:bg-red-900/30" },
  { name: "Carbohydrates", icon: Wheat, foods: ["Brown rice", "Oats", "Sweet potato", "Quinoa", "Whole grain bread"], color: "bg-amber-100 dark:bg-amber-900/30" },
  { name: "Healthy Fats", icon: Fish, foods: ["Avocado", "Olive oil", "Nuts", "Seeds", "Fatty fish"], color: "bg-blue-100 dark:bg-blue-900/30" },
  { name: "Dairy", icon: Milk, foods: ["Milk", "Cottage cheese", "Kefir", "Cheese", "Yogurt"], color: "bg-purple-100 dark:bg-purple-900/30" },
];

const trainingPlans = [
  { id: "weight_loss", title: "Weight Loss Program", description: "High-intensity cardio + strength to burn calories.", icon: Flame, duration: "8-12 weeks", sessions: "4-5 / week", level: "Beginner to Intermediate", color: "from-orange-500 to-red-600" },
  { id: "muscle_building", title: "Muscle Building", description: "Progressive resistance for hypertrophy.", icon: Dumbbell, duration: "12-16 weeks", sessions: "5-6 / week", level: "Intermediate+", color: "from-blue-500 to-indigo-600" },
  { id: "general_fitness", title: "General Fitness", description: "Strength, cardio, and flexibility for overall health.", icon: Heart, duration: "Ongoing", sessions: "3-4 / week", level: "All Levels", color: "from-green-500 to-teal-600" },
  { id: "strength_training", title: "Strength Training", description: "Heavy compound lifts and powerlifting.", icon: Target, duration: "10-14 weeks", sessions: "4 / week", level: "Intermediate+", color: "from-purple-500 to-violet-600" },
  { id: "endurance_training", title: "Endurance Training", description: "Build stamina and cardiovascular endurance.", icon: Zap, duration: "8-12 weeks", sessions: "5-6 / week", level: "Beginner+", color: "from-cyan-500 to-blue-600" },
  { id: "maintenance", title: "Maintenance", description: "Stay consistent and prevent injuries.", icon: Award, duration: "Ongoing", sessions: "3 / week", level: "All Levels", color: "from-gray-500 to-slate-600" },
];

const services = [
  { icon: Dumbbell, title: "Personal Training", desc: "1-on-1 sessions with Coach Dave." },
  { icon: Apple, title: "Nutrition Planning", desc: "Custom meal plans built around your BMI/BMR." },
  { icon: Activity, title: "Progress Tracking", desc: "Photos, weight, and charts over time." },
  { icon: Calendar, title: "Custom Schedules", desc: "Personalized training calendar." },
  { icon: MessageSquare, title: "24/7 Coach Chat", desc: "Direct messaging anytime." },
  { icon: Users, title: "Group Classes", desc: "Train and stay motivated together." },
];

const Index = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const location = useLocation();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [active, setActive] = useState<EventItem | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const CONTACT_EMAIL = "onelovefitness12@gmail.com";
  const PHONE_NUMBER = "+15129389057";
  const DISPLAY_PHONE = "+1 (512) 938-9057";

  useEffect(() => {
    supabase.from("events").select("*").order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => { if (data) setEvents(data as any); });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  // Smooth-scroll on hash navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [location]);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`New Message from ${contact.name}`);
    const body = encodeURIComponent(`Name: ${contact.name}\nEmail: ${contact.email}\n\nMessage:\n${contact.message}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    toast({ title: "Message ready!", description: "Your email client will open." });
    setContact({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Navbar />

      {/* Hero */}
      <section id="home" className="relative min-h-[100vh] md:min-h-[92vh] flex items-center justify-center px-4 overflow-hidden pt-20 md:pt-28 scroll-mt-0 mt-16 md:mt-0">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Fitness hero background"
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 right-0 h-full w-full object-cover transition-opacity duration-1000 z-0 top-16 md:top-0"
            style={{ opacity: heroIndex === index ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/15 to-background/0 dark:from-background/70 dark:via-background/45 dark:to-background/5 z-10 top-16 md:top-0" />
        <div className="container mx-auto relative z-20 text-center space-y-4 md:space-y-8 px-2 sm:px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">{t("neonVolt")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
            {t("trainWithPurpose")}
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent text-glow">
              {t("liveWithPower")}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/80 max-w-3xl mx-auto px-2">
            {t("brand")} — personalized coaching, smart nutrition, and high-voltage training plans built around you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link to="/auth?tab=signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-primary shadow-glow text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-semibold">
                {t("startFreeTrial")} <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <a href="#about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-background/50 backdrop-blur-sm border-primary/40 hover:bg-primary/10">
                {t("learnMore")}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-12 md:py-20 px-4 scroll-mt-24">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t("aboutFitCoachPro")}</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">{t("trustedPartner")}</p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto mb-10">{t("fitCoachProDesc")}</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[{ icon: Award, title: t("certifiedExperts"), desc: t("allCoachesCertified") },
              { icon: Target, title: t("goalOriented"), desc: t("everyPlanTailored") },
              { icon: Heart, title: t("communitySupport"), desc: t("joinSupportiveCommunity") }].map((c, i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                    <c.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{c.title}</h3>
                  <p className="text-muted-foreground text-sm">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">{t("meetOurCoach")}</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
              <div className="w-56 h-56 rounded-full overflow-hidden shadow-lg shrink-0">
                <img src={dawitPhoto} alt={t("dawitSemere")} className="w-full h-full object-cover" />
              </div>
              <div className="text-left max-w-md">
                <h4 className="text-xl font-semibold mb-3">{t("dawitSemere")}</h4>
                <p className="text-muted-foreground leading-relaxed">{t("dawitDescription")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-12 md:py-20 px-4 bg-secondary/30 scroll-mt-24">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Services</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive wellness services designed for your transformation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <Card key={s.title} className="shadow-card hover:shadow-smooth transition-shadow">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                    <s.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nutrition */}
      <section id="nutrition" className="py-12 md:py-20 px-4 scroll-mt-24">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Nutrition <span className="text-primary">Planning</span></h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-3">
              Fuel your body with personalized meal plans matched to your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {nutritionPlans.map((plan, index) => (
              <Card key={index} className="shadow-card hover:shadow-smooth transition-all overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${plan.color} text-white`}>
                  <div className="flex items-center gap-4">
                    <plan.icon className="w-8 h-8" />
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary" />{f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {foodCategories.map((category, index) => (
              <Card key={index} className={`${category.color} border-0 shadow-card`}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <category.icon className="w-7 h-7 text-primary" />
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {category.foods.map((food, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {food}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Training */}
      <section id="training" className="py-12 md:py-20 px-4 bg-secondary/30 scroll-mt-24">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Training <span className="text-primary">Programs</span></h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-3">
              Choose from expert-designed programs tailored to your level.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingPlans.map((plan) => (
              <Card key={plan.id} className="shadow-card hover:shadow-smooth transition-all overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${plan.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <plan.icon className="w-8 h-8" />
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-secondary/50 rounded p-2">
                      <span className="text-muted-foreground text-xs">Duration</span>
                      <p className="font-medium">{plan.duration}</p>
                    </div>
                    <div className="bg-secondary/50 rounded p-2">
                      <span className="text-muted-foreground text-xs">Sessions</span>
                      <p className="font-medium">{plan.sessions}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded p-2 text-sm">
                    <span className="text-muted-foreground text-xs">Level</span>
                    <p className="font-medium">{plan.level}</p>
                  </div>
                  <Link to={`/auth?tab=signup&plan=${plan.id}`} className="block">
                    <Button className="w-full bg-gradient-primary">Select Program</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers / featured progress */}
      <TrainersSection />

      {/* Events */}
      {events.length > 0 && (
        <section id="events" className="py-12 md:py-16 px-4 scroll-mt-24">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("upcomingEvents")}</h2>
              <p className="text-base md:text-lg text-muted-foreground">{t("latestEventsCoach")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((ev) => (
                <button key={ev.id} onClick={() => setActive(ev)} className="group text-left rounded-2xl bg-card border border-border hover:border-primary/50 shadow-card hover:shadow-glow transition-all overflow-hidden">
                  {ev.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-primary" />
                  )}
                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{ev.title}</h3>
                    {ev.description && <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>}
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
          {active?.image_url && <img src={active.image_url} alt={active.title} className="w-full max-h-[380px] object-cover rounded-lg" />}
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{active?.content}</p>
        </DialogContent>
      </Dialog>

      {/* Contact */}
      <section id="contact" className="py-12 md:py-20 px-4 bg-secondary/30 scroll-mt-24">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">Get In Touch</h2>
          <p className="text-base md:text-lg text-muted-foreground text-center mb-10">Have questions? We'd love to hear from you.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleContact} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-name">Name</Label>
                    <Input id="c-name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email">Email</Label>
                    <Input id="c-email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-msg">Message</Label>
                    <Textarea id="c-msg" rows={5} value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary">Send Message</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="shadow-card">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground text-sm break-all">{CONTACT_EMAIL}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground text-sm">{DISPLAY_PHONE}</p>
                    </div>
                  </div>
                  <Button onClick={() => window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent("Hello, I'm interested in your fitness coaching.")}`, "_blank")} className="w-full bg-green-500 hover:bg-green-600 text-white gap-2">
                    <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-muted-foreground text-sm">1610 Mayflower Dr, Richardson, US</p>
                    </div>
                  </div>
                  <Button onClick={() => window.open(`https://maps.google.com/?q=1610+Mayflower+Dr,+Richardson,+TX`, "_blank")} className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2">
                    <MapPin className="w-4 h-4" /> View on Google Maps
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Ready to Start Your Journey?</h2>
          <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto">{t("joinThousands")}</p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-smooth font-semibold">
              {t("getStarted")}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-6 md:py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm md:text-base">
          <p>© 2026 {t("brand")}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
