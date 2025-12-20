import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Apple, AlertTriangle, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NutritionData {
  dailyCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  recommendedFoods: { name: string; benefits: string }[];
  avoidFoods: string[];
  mealSuggestions: { name: string; description: string }[];
}

interface AINutritionRecommendationsProps {
  bmi: number | null;
}

export const AINutritionRecommendations = ({ bmi }: AINutritionRecommendationsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);

  const fetchNutrition = async () => {
    if (!bmi) {
      toast({
        title: "BMI Required",
        description: "Please calculate your BMI first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-nutrition", {
        body: { bmi },
      });

      if (error) throw error;
      setNutritionData(data);
    } catch (error: any) {
      console.error("Error fetching nutrition:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch nutrition recommendations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = () => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Nutrition Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!bmi ? (
          <p className="text-muted-foreground text-center py-4">
            Calculate your BMI first to get personalized nutrition recommendations.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your BMI</p>
                <p className="text-2xl font-bold">{bmi.toFixed(1)}</p>
                <Badge variant="secondary">{getBMICategory()}</Badge>
              </div>
              <Button onClick={fetchNutrition} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            </div>

            {nutritionData && (
              <div className="space-y-6 mt-6">
                {/* Daily Targets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{nutritionData.dailyCalories}</p>
                    <p className="text-sm text-muted-foreground">Daily Calories</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-blue-500">{nutritionData.macros.protein}g</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-500">{nutritionData.macros.carbs}g</p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-orange-500">{nutritionData.macros.fats}g</p>
                    <p className="text-sm text-muted-foreground">Fats</p>
                  </div>
                </div>

                {/* Recommended Foods */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Apple className="w-4 h-4 text-green-500" />
                    Recommended Foods
                  </h4>
                  <div className="grid gap-2">
                    {nutritionData.recommendedFoods.map((food, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{food.name}</span>
                        <span className="text-sm text-muted-foreground">{food.benefits}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Foods to Avoid */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Foods to Limit
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nutritionData.avoidFoods.map((food, index) => (
                      <Badge key={index} variant="outline" className="text-destructive border-destructive">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Meal Suggestions */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-primary" />
                    Meal Suggestions
                  </h4>
                  <div className="grid gap-3">
                    {nutritionData.mealSuggestions.map((meal, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
