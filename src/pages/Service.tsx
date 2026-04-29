import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Apple, MessageSquare, Calendar, Activity, Users } from "lucide-react";

const services = [
  { icon: Dumbbell, title: "Personal Training", desc: "1-on-1 training sessions with certified coach Dave." },
  { icon: Apple, title: "Nutrition Planning", desc: "Custom meal plans based on BMI, BMR & goals." },
  { icon: Activity, title: "Progress Tracking", desc: "Monitor weight, photos & charts over time." },
  { icon: Calendar, title: "Custom Schedules", desc: "Personal training schedules tailored to you." },
  { icon: MessageSquare, title: "24/7 Coach Chat", desc: "Direct messages with your coach anytime." },
  { icon: Users, title: "Group Classes", desc: "Join group sessions and stay motivated." },
];

const Service = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-16 px-4 bg-gradient-hero">
      <div className="container mx-auto text-center text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
        <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto">
          Comprehensive wellness services designed for your transformation.
        </p>
      </div>
    </section>
    <section className="py-12 md:py-16 px-4">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </section>
  </div>
);

export default Service;
