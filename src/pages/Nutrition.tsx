import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Salad, Beef, Fish, Egg, Milk, Wheat, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const nutritionPlans = [
  {
    title: "Weight Loss Plan",
    description: "Calorie-deficit meals designed to help you shed unwanted pounds while maintaining muscle mass.",
    icon: Salad,
    features: ["Low-calorie meals", "High protein intake", "Fiber-rich foods", "Portion control"],
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Muscle Building Plan",
    description: "High-protein nutrition designed to support muscle growth and recovery after intense workouts.",
    icon: Beef,
    features: ["High protein meals", "Complex carbohydrates", "Post-workout nutrition", "Calorie surplus"],
    color: "from-red-500 to-rose-600"
  },
  {
    title: "Balanced Diet Plan",
    description: "Well-rounded nutrition for overall health maintenance and sustained energy throughout the day.",
    icon: Apple,
    features: ["Balanced macros", "Variety of foods", "Sustainable eating", "Micronutrient focus"],
    color: "from-orange-500 to-amber-600"
  },
  {
    title: "Vegetarian Plan",
    description: "Plant-based nutrition that meets all your dietary needs without meat products.",
    icon: Leaf,
    features: ["Plant proteins", "Iron-rich foods", "B12 supplements", "Complete amino acids"],
    color: "from-teal-500 to-cyan-600"
  }
];

const foodCategories = [
  { name: "Proteins", icon: Egg, foods: ["Chicken breast", "Salmon", "Eggs", "Greek yogurt", "Tofu"], color: "bg-red-100 dark:bg-red-900/30" },
  { name: "Carbohydrates", icon: Wheat, foods: ["Brown rice", "Oats", "Sweet potato", "Quinoa", "Whole grain bread"], color: "bg-amber-100 dark:bg-amber-900/30" },
  { name: "Healthy Fats", icon: Fish, foods: ["Avocado", "Olive oil", "Nuts", "Seeds", "Fatty fish"], color: "bg-blue-100 dark:bg-blue-900/30" },
  { name: "Dairy", icon: Milk, foods: ["Milk", "Cottage cheese", "Kefir", "Cheese", "Yogurt"], color: "bg-purple-100 dark:bg-purple-900/30" }
];

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
        <div className="container mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Apple className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Nutrition <span className="text-primary">Planning</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fuel your body with personalized meal plans designed to match your fitness goals and lifestyle
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-gradient-primary shadow-smooth">
              Get Your Custom Plan
            </Button>
          </Link>
        </div>
      </section>

      {/* Nutrition Plans */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Nutrition Plans</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {nutritionPlans.map((plan, index) => (
              <Card key={index} className="shadow-card hover:shadow-smooth transition-all duration-300 overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${plan.color} text-white`}>
                  <div className="flex items-center gap-4">
                    <plan.icon className="w-10 h-10" />
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-muted-foreground">{plan.description}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Essential Food Groups</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {foodCategories.map((category, index) => (
              <Card key={index} className={`${category.color} border-0 shadow-card`}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <category.icon className="w-8 h-8 text-primary" />
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                  </div>
                  <ul className="space-y-2">
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

      {/* AI Nutrition Feature */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="shadow-smooth bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-12 text-center space-y-6">
              <h2 className="text-3xl font-bold">AI-Powered Nutrition Recommendations</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get personalized meal suggestions based on your BMI, fitness goals, and dietary preferences. 
                Our AI analyzes your profile to recommend the perfect nutrition plan for you.
              </p>
              <Link to="/auth?tab=signup">
                <Button size="lg" className="bg-gradient-primary shadow-smooth">
                  Start Your Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
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

export default Nutrition;
