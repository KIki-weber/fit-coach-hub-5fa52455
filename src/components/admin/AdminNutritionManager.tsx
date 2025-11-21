import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Apple, Plus } from "lucide-react";

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
}

export const AdminNutritionManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [nutritionData, setNutritionData] = useState({
    title: "",
    description: "",
    protein: "",
    vitamins: "",
    calories: "",
    carbs: "",
    fats: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .order("full_name");

    if (data) {
      setUsers(data);
    }
  };

  const handleCreateNutrition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast({
        title: "Select a user",
        description: "Please select a user to assign this nutrition plan to.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("nutrition").insert({
      user_id: selectedUser,
      title: nutritionData.title,
      description: nutritionData.description || null,
      protein: nutritionData.protein ? parseFloat(nutritionData.protein) : null,
      vitamins: nutritionData.vitamins || null,
      calories: nutritionData.calories ? parseFloat(nutritionData.calories) : null,
      carbs: nutritionData.carbs ? parseFloat(nutritionData.carbs) : null,
      fats: nutritionData.fats ? parseFloat(nutritionData.fats) : null,
      notes: nutritionData.notes || null,
      created_by: session?.user.id,
    });

    if (error) {
      toast({
        title: "Failed to create nutrition plan",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nutrition Plan Created",
        description: "Nutrition plan has been assigned to the user.",
      });
      setNutritionData({
        title: "",
        description: "",
        protein: "",
        vitamins: "",
        calories: "",
        carbs: "",
        fats: "",
        notes: "",
      });
      setSelectedUser("");
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-primary" />
          Nutrition Manager
        </CardTitle>
        <CardDescription>Create nutrition plans for users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateNutrition} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nutrition-user-select">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="nutrition-user-select">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutrition-title">Plan Title</Label>
            <Input
              id="nutrition-title"
              value={nutritionData.title}
              onChange={(e) => setNutritionData({ ...nutritionData, title: e.target.value })}
              placeholder="High Protein Diet Plan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutrition-description">Description</Label>
            <Textarea
              id="nutrition-description"
              value={nutritionData.description}
              onChange={(e) => setNutritionData({ ...nutritionData, description: e.target.value })}
              placeholder="Details about the nutrition plan..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nutrition-protein">Protein (g)</Label>
              <Input
                id="nutrition-protein"
                type="number"
                step="0.1"
                value={nutritionData.protein}
                onChange={(e) => setNutritionData({ ...nutritionData, protein: e.target.value })}
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nutrition-calories">Calories</Label>
              <Input
                id="nutrition-calories"
                type="number"
                step="0.1"
                value={nutritionData.calories}
                onChange={(e) => setNutritionData({ ...nutritionData, calories: e.target.value })}
                placeholder="2000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nutrition-carbs">Carbs (g)</Label>
              <Input
                id="nutrition-carbs"
                type="number"
                step="0.1"
                value={nutritionData.carbs}
                onChange={(e) => setNutritionData({ ...nutritionData, carbs: e.target.value })}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nutrition-fats">Fats (g)</Label>
              <Input
                id="nutrition-fats"
                type="number"
                step="0.1"
                value={nutritionData.fats}
                onChange={(e) => setNutritionData({ ...nutritionData, fats: e.target.value })}
                placeholder="50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutrition-vitamins">Vitamins & Supplements</Label>
            <Input
              id="nutrition-vitamins"
              value={nutritionData.vitamins}
              onChange={(e) => setNutritionData({ ...nutritionData, vitamins: e.target.value })}
              placeholder="Vitamin D, B12, Omega-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutrition-notes">Additional Notes</Label>
            <Textarea
              id="nutrition-notes"
              value={nutritionData.notes}
              onChange={(e) => setNutritionData({ ...nutritionData, notes: e.target.value })}
              placeholder="Special dietary requirements or recommendations..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Create Nutrition Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
