import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Target, Flame, Heart, Zap, Clock, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

const trainingPlans = [
  {
    id: "weight_loss",
    title: "Weight Loss Program",
    description: "High-intensity cardio and strength training designed to burn calories and shed excess weight.",
    icon: Flame,
    duration: "8-12 weeks",
    sessions: "4-5 per week",
    level: "Beginner to Intermediate",
    features: ["HIIT workouts", "Cardio sessions", "Metabolic conditioning", "Fat-burning exercises"],
    color: "from-orange-500 to-red-600"
  },
  {
    id: "muscle_building",
    title: "Muscle Building Program",
    description: "Progressive resistance training focused on hypertrophy and building lean muscle mass.",
    icon: Dumbbell,
    duration: "12-16 weeks",
    sessions: "5-6 per week",
    level: "Intermediate to Advanced",
    features: ["Compound movements", "Isolation exercises", "Progressive overload", "Rest-pause training"],
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "general_fitness",
    title: "General Fitness Program",
    description: "Balanced training for overall health, combining strength, cardio, and flexibility.",
    icon: Heart,
    duration: "Ongoing",
    sessions: "3-4 per week",
    level: "All Levels",
    features: ["Full-body workouts", "Cardiovascular health", "Flexibility training", "Functional fitness"],
    color: "from-green-500 to-teal-600"
  },
  {
    id: "strength_training",
    title: "Strength Training Program",
    description: "Focus on building raw strength with heavy compound lifts and powerlifting techniques.",
    icon: Target,
    duration: "10-14 weeks",
    sessions: "4 per week",
    level: "Intermediate to Advanced",
    features: ["Powerlifting basics", "Strength periodization", "Max effort days", "Accessory work"],
    color: "from-purple-500 to-violet-600"
  },
  {
    id: "endurance_training",
    title: "Endurance Training Program",
    description: "Build stamina and cardiovascular endurance for long-distance activities.",
    icon: Zap,
    duration: "8-12 weeks",
    sessions: "5-6 per week",
    level: "Beginner to Intermediate",
    features: ["Aerobic conditioning", "Interval training", "Recovery sessions", "Performance tracking"],
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: "maintenance",
    title: "Maintenance Program",
    description: "Keep your current fitness level while focusing on consistency and injury prevention.",
    icon: Award,
    duration: "Ongoing",
    sessions: "3 per week",
    level: "All Levels",
    features: ["Balanced routines", "Active recovery", "Mobility work", "Stress management"],
    color: "from-gray-500 to-slate-600"
  }
];

const benefits = [
  { icon: Users, title: "Expert Coaching", description: "Work with certified trainers who guide you every step" },
  { icon: Clock, title: "Flexible Scheduling", description: "Book sessions that fit your busy lifestyle" },
  { icon: Target, title: "Goal Tracking", description: "Monitor progress with detailed analytics" },
  { icon: Award, title: "Proven Results", description: "Join thousands who achieved their fitness goals" }
];

const Training = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 md:pt-24 pb-10 md:pb-16 px-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
        <div className="container mx-auto text-center space-y-4 md:space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Dumbbell className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Training <span className="text-primary">Programs</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Choose from our expert-designed training programs tailored to your fitness goals and experience level
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-gradient-primary shadow-smooth">
              Start Training Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 md:py-12 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-background shadow-card">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Plans */}
      <section className="py-10 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Choose Your Program</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trainingPlans.map((plan) => (
              <Card key={plan.id} className="shadow-card hover:shadow-smooth transition-all duration-300 overflow-hidden group">
                <CardHeader className={`bg-gradient-to-r ${plan.color} text-white`}>
                  <div className="flex items-center gap-4">
                    <plan.icon className="w-10 h-10" />
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-secondary/50 rounded p-2">
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{plan.duration}</p>
                    </div>
                    <div className="bg-secondary/50 rounded p-2">
                      <span className="text-muted-foreground">Sessions:</span>
                      <p className="font-medium">{plan.sessions}</p>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 rounded p-2">
                    <span className="text-muted-foreground text-sm">Level:</span>
                    <p className="font-medium text-sm">{plan.level}</p>
                  </div>
                  
                  <ul className="space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={`/auth?tab=signup&plan=${plan.id}`} className="block">
                    <Button className="w-full bg-gradient-primary">
                      Select Program
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2">
            Ready to Transform Your Body?
          </h2>
          <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto px-2">
            Join OneLove Fitness today and get access to personalized training programs, expert coaching, and a supportive community
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-smooth">
              Get Started Free
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

export default Training;
