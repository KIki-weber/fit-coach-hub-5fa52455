import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BMRCalculatorProps {
  onCalculate?: (bmr: number) => void;
}

type Unit = "metric" | "imperial";

export const BMRCalculator = ({ onCalculate }: BMRCalculatorProps) => {
  const [unit, setUnit] = useState<Unit>("imperial");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [bmr, setBmr] = useState<number | null>(null);

  useEffect(() => {
    autoFill();
  }, []);

  const autoFill = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("profiles")
      .select("height, weight, height_unit, weight_unit, age, gender")
      .eq("user_id", session.user.id)
      .single();
    if (!data) return;
    const useImperial = (data.height_unit === "in" || data.weight_unit === "lb");
    setUnit(useImperial ? "imperial" : "metric");
    if (data.height) setHeight(useImperial ? (Number(data.height) / 2.54).toFixed(1) : String(data.height));
    if (data.weight) setWeight(useImperial ? (Number(data.weight) * 2.20462).toFixed(1) : String(data.weight));
    if ((data as any).age) setAge(String((data as any).age));
    if (data.gender) setGender(data.gender === "female" ? "female" : "male");
  };

  const calculateBMR = () => {
    const a = parseFloat(age);
    let w = parseFloat(weight);
    let h = parseFloat(height);
    if (!(w > 0 && h > 0 && a > 0)) return;
    // Convert to metric for Mifflin/Harris formula consistency
    if (unit === "imperial") {
      w = w * 0.453592; // lb → kg
      h = h * 2.54;     // in → cm
    }
    const result = gender === "male"
      ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
      : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    const v = Math.round(result);
    setBmr(v);
    onCalculate?.(v);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          BMR Calculator
        </CardTitle>
        <CardDescription>Basal Metabolic Rate — auto-filled from your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Tabs value={unit} onValueChange={(v) => setUnit(v as Unit)}>
            <TabsList>
              <TabsTrigger value="imperial">lb / in</TabsTrigger>
              <TabsTrigger value="metric">kg / cm</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button type="button" variant="ghost" size="sm" onClick={autoFill}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refill
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmr-height">Height ({unit === "imperial" ? "in" : "cm"})</Label>
            <Input id="bmr-height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-weight">Weight ({unit === "imperial" ? "lb" : "kg"})</Label>
            <Input id="bmr-weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-age">Age</Label>
            <Input id="bmr-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="bmr-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculateBMR} className="w-full bg-gradient-primary">
          Calculate BMR
        </Button>

        {bmr !== null && (
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{bmr}</div>
            <div className="text-sm text-muted-foreground">calories/day</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
