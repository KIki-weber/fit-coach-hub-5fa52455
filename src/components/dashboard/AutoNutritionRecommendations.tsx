import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

interface AutoNutritionRecommendationsProps {
  bmi: number | null;
  bmr: number | null;
}

const AutoNutritionRecommendations = ({ bmi, bmr }: AutoNutritionRecommendationsProps) => {
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  };

  const getRecommendations = () => {
    if (!bmi || !bmr) {
      return {
        title: "Complete Your Profile",
        description: "Add your height and weight to get personalized nutrition recommendations.",
        calories: null,
        protein: null,
        carbs: null,
        fats: null,
        tips: [],
      };
    }

    const category = getBMICategory(bmi);
    let calorieAdjustment = 1;
    let tips: string[] = [];

    switch (category) {
      case "underweight":
        calorieAdjustment = 1.2;
        tips = [
          "Focus on nutrient-dense, calorie-rich foods",
          "Eat frequent, smaller meals throughout the day",
          "Include healthy fats like avocados, nuts, and olive oil",
          "Consider strength training to build muscle mass",
        ];
        break;
      case "normal":
        calorieAdjustment = 1.1;
        tips = [
          "Maintain a balanced diet with variety",
          "Stay consistent with your eating schedule",
          "Keep up with regular physical activity",
          "Focus on whole, unprocessed foods",
        ];
        break;
      case "overweight":
        calorieAdjustment = 0.9;
        tips = [
          "Create a moderate calorie deficit (250-500 calories)",
          "Increase protein intake to preserve muscle mass",
          "Focus on high-fiber foods to stay fuller longer",
          "Incorporate regular cardiovascular exercise",
        ];
        break;
      case "obese":
        calorieAdjustment = 0.8;
        tips = [
          "Consult with your coach for a structured plan",
          "Focus on sustainable lifestyle changes",
          "Prioritize whole foods and eliminate processed foods",
          "Start with low-impact exercises and gradually increase intensity",
        ];
        break;
    }

    const dailyCalories = Math.round(bmr * calorieAdjustment);
    const protein = Math.round((dailyCalories * 0.3) / 4); // 30% of calories, 4 cal/g
    const carbs = Math.round((dailyCalories * 0.4) / 4); // 40% of calories, 4 cal/g
    const fats = Math.round((dailyCalories * 0.3) / 9); // 30% of calories, 9 cal/g

    return {
      title: "Your Personalized Nutrition Plan",
      description: `Based on your BMI (${bmi.toFixed(1)}) and BMR (${bmr.toFixed(0)}), here are your daily targets:`,
      calories: dailyCalories,
      protein,
      carbs,
      fats,
      tips,
    };
  };

  const recommendations = getRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          {recommendations.title}
        </CardTitle>
        <CardDescription>{recommendations.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.calories && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{recommendations.calories}</p>
                <p className="text-sm text-muted-foreground">Calories/day</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{recommendations.protein}g</p>
                <p className="text-sm text-muted-foreground">Protein</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{recommendations.carbs}g</p>
                <p className="text-sm text-muted-foreground">Carbs</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{recommendations.fats}g</p>
                <p className="text-sm text-muted-foreground">Fats</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <p className="font-semibold mb-2">Recommendations:</p>
                <ul className="space-y-1 list-disc list-inside">
                  {recommendations.tips.map((tip, index) => (
                    <li key={index} className="text-sm">{tip}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoNutritionRecommendations;
