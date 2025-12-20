import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Users, Calendar, TrendingUp, Apple, Dumbbell, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-fitness.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center px-4"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="container mx-auto relative z-10 text-center space-y-8 pt-16">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Transform Your Health with
            <span className="text-primary block mt-2">Expert Wellness Coaching</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
            Get personalized wellness plans, track your progress, and achieve your health goals with expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-gradient-primary shadow-smooth text-lg px-8 py-6">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-background/50 backdrop-blur-sm">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose VitalityHub?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Wellness Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive health and fitness solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of people transforming their lives with personalized coaching
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-smooth">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2024 VitalityHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
