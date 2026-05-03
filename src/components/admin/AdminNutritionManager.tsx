import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Apple } from "lucide-react";

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  height_unit?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  exercise_plan?: string | null;
  photo_url?: string | null;
}

export const AdminNutritionManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const uploadFile = async (file: File | null, prefix: string, bucket: string): Promise<string | null> => {
    if (!file) return null;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || undefined });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, phone_number, age, gender, height, height_unit, weight, weight_unit, exercise_plan, photo_url")
      .order("full_name");

    if (data) {
      setUsers(data as any);
    }
  };

  const handleCreateNutrition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast({
        title: "Select a user",
        description: "Please select a user to assign this nutrition plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const pdf_url = await uploadFile(pdfFile, "nutrition", "plan-pdfs");
    const image_url = await uploadFile(imageFile, "nutrition-images", "event-photos");

    const reset = () => {
      setNutritionData({ title: "", description: "", protein: "", vitamins: "", calories: "", carbs: "", fats: "", notes: "" });
      setPdfFile(null);
      setImageFile(null);
      setSelectedUser("");
    };

    if (selectedUser === "all") {
      const nutritionPlans = users.map(user => ({
        user_id: user.user_id,
        title: nutritionData.title,
        description: nutritionData.description || null,
        protein: nutritionData.protein ? parseFloat(nutritionData.protein) : null,
        calories: nutritionData.calories ? parseFloat(nutritionData.calories) : null,
        carbs: nutritionData.carbs ? parseFloat(nutritionData.carbs) : null,
        fats: nutritionData.fats ? parseFloat(nutritionData.fats) : null,
        vitamins: nutritionData.vitamins || null,
        notes: nutritionData.notes || null,
        pdf_url,
        image_url,

      const { error } = await supabase.from("nutrition").insert(nutritionPlans);
      if (error) {
        toast({ title: "Failed to create nutrition plans", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Nutrition Plans Created", description: `Sent to all ${users.length} users.` });
        reset();
      }
    } else {
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
        pdf_url,
        image_url,

      if (error) {
        toast({ title: "Failed to create nutrition plan", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Nutrition Plan Created", description: "Plan has been assigned to the user." });
        reset();
      }
    }
    setLoading(false);
  };

  const selectedUserData = users.find(u => u.user_id === selectedUser);
  const heightCm = selectedUserData?.height
    ? (selectedUserData.height_unit === "in" ? selectedUserData.height * 2.54 : selectedUserData.height)
    : null;
  const weightKg = selectedUserData?.weight
    ? (selectedUserData.weight_unit === "lb" ? selectedUserData.weight * 0.453592 : selectedUserData.weight)
    : null;
  const bmi = heightCm && weightKg ? (weightKg / ((heightCm / 100) ** 2)).toFixed(1) : null;
  const bmr = heightCm && weightKg && selectedUserData?.age
    ? Math.round((selectedUserData.gender === "female" ? -161 : 5) + 10 * weightKg + 6.25 * heightCm - 5 * selectedUserData.age)
    : null;
  // Recommended daily calories (sedentary x1.2, light x1.375)
  const tdee = bmr ? Math.round(bmr * 1.375) : null;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-primary" />
          Nutrition Manager
        </CardTitle>
        <CardDescription>Create nutrition plans for users — auto-calculates BMI, BMR & calorie needs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateNutrition} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nutrition-user-select">Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="nutrition-user-select">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUser && selectedUser !== "all" && selectedUserData && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-semibold">User Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedUserData.full_name || "N/A"}</p>
                    <p><span className="font-medium">Email:</span> {selectedUserData.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedUserData.phone_number || "N/A"}</p>
                    <p><span className="font-medium">Age:</span> {selectedUserData.age ?? "N/A"}</p>
                    <p><span className="font-medium">Gender:</span> <span className="capitalize">{selectedUserData.gender || "N/A"}</span></p>
                    <p><span className="font-medium">Plan:</span> {selectedUserData.exercise_plan || "N/A"}</p>
                    <p><span className="font-medium">Height:</span> {selectedUserData.height ? `${selectedUserData.height} ${selectedUserData.height_unit || 'cm'}` : "N/A"}</p>
                    <p><span className="font-medium">Weight:</span> {selectedUserData.weight ? `${selectedUserData.weight} ${selectedUserData.weight_unit || 'kg'}` : "N/A"}</p>
                  </div>
                  <div className="pt-2 border-t border-border grid grid-cols-3 gap-2 text-sm">
                    <p><span className="font-medium">BMI:</span> <span className="text-primary font-semibold">{bmi || "N/A"}</span></p>
                    <p><span className="font-medium">BMR:</span> <span className="text-primary font-semibold">{bmr ? `${bmr}` : "N/A"}</span></p>
                    <p><span className="font-medium">~Daily kcal:</span> <span className="text-primary font-semibold">{tdee || "N/A"}</span></p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="nutrition-pdf">Attach PDF (optional)</Label>
                <Input
                  id="nutrition-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                {pdfFile && <p className="text-xs text-muted-foreground">Selected: {pdfFile.name}</p>}
              </div>

              <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                <Apple className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Nutrition Plan"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
