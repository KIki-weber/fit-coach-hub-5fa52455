import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple } from "lucide-react";

interface Nutrition {
  id: string;
  title: string;
  description: string;
  protein: number;
  vitamins: string;
  calories: number;
  carbs: number;
  fats: number;
  notes: string;
  created_at: string;
}

export const NutritionView = () => {
  const [nutritionPlans, setNutritionPlans] = useState<Nutrition[]>([]);

  useEffect(() => {
    fetchNutrition();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('nutrition-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nutrition'
        },
        () => {
          fetchNutrition();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNutrition = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("nutrition")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setNutritionPlans(data);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-primary" />
          My Nutrition Plans
        </CardTitle>
        <CardDescription>View your personalized nutrition plans</CardDescription>
      </CardHeader>
      <CardContent>
        {nutritionPlans.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No nutrition plans assigned yet.
          </p>
        ) : (
          <div className="space-y-4">
            {nutritionPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 bg-secondary/30 rounded-lg border border-border"
              >
                <h4 className="font-semibold text-lg mb-2">{plan.title}</h4>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {plan.calories && (
                    <div className="bg-background/50 p-2 rounded">
                      <span className="text-xs text-muted-foreground">Calories</span>
                      <p className="font-semibold">{plan.calories} kcal</p>
                    </div>
                  )}
                  {plan.protein && (
                    <div className="bg-background/50 p-2 rounded">
                      <span className="text-xs text-muted-foreground">Protein</span>
                      <p className="font-semibold">{plan.protein}g</p>
                    </div>
                  )}
                  {plan.carbs && (
                    <div className="bg-background/50 p-2 rounded">
                      <span className="text-xs text-muted-foreground">Carbs</span>
                      <p className="font-semibold">{plan.carbs}g</p>
                    </div>
                  )}
                  {plan.fats && (
                    <div className="bg-background/50 p-2 rounded">
                      <span className="text-xs text-muted-foreground">Fats</span>
                      <p className="font-semibold">{plan.fats}g</p>
                    </div>
                  )}
                </div>

                {plan.vitamins && (
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground">Vitamins & Supplements:</span>
                    <p className="text-sm">{plan.vitamins}</p>
                  </div>
                )}

                {plan.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Notes:</span>
                    <p className="text-sm mt-1">{plan.notes}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Created: {new Date(plan.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
