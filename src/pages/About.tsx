import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            About FitCoach Pro
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Your trusted partner in achieving fitness excellence
          </p>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              FitCoach Pro is more than just a training platform – it's a comprehensive fitness ecosystem designed to help you reach your goals. We combine expert coaching, personalized training plans, and advanced tracking tools to deliver results that last.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Certified Experts</h3>
                <p className="text-muted-foreground">
                  All our coaches are certified professionals with years of experience
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Goal-Oriented</h3>
                <p className="text-muted-foreground">
                  Every plan is tailored to your specific fitness objectives
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Community Support</h3>
                <p className="text-muted-foreground">
                  Join a supportive community committed to health and wellness
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-primary rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              To empower individuals to achieve their fitness goals through personalized coaching, scientific training methods, and unwavering support. We believe everyone deserves access to expert guidance on their fitness journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
