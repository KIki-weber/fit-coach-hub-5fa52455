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
  const [heightCm, setHeightCm] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [bmr, setBmr] = useState<number | null>(null);

  useEffect(() => { autoFill(); }, []);

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
    if (data.height) {
      const cm = Number(data.height);
      if (useImperial) {
        const totalIn = cm / 2.54;
        const ft = Math.floor(totalIn / 12);
        setFeet(String(ft));
        setInches(String(+(totalIn - ft * 12).toFixed(1)));
      } else {
        setHeightCm(String(cm));
      }
    }
    if (data.weight) setWeight(useImperial ? (Number(data.weight) * 2.20462).toFixed(1) : String(data.weight));
    if ((data as any).age) setAge(String((data as any).age));
    if (data.gender) setGender(data.gender === "female" ? "female" : "male");
  };

  const calculateBMR = () => {
    const a = parseFloat(age);
    let w = parseFloat(weight);
    if (!(w > 0 && a > 0)) return;
    let h_cm: number;
    if (unit === "imperial") {
      const totalIn = (parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0);
      if (totalIn <= 0) return;
      h_cm = totalIn * 2.54;
      w = w * 0.453592;
    } else {
      h_cm = parseFloat(heightCm);
      if (!(h_cm > 0)) return;
    }
    const result = gender === "male"
      ? 88.362 + (13.397 * w) + (4.799 * h_cm) - (5.677 * a)
      : 447.593 + (9.247 * w) + (3.098 * h_cm) - (4.330 * a);
    const v = Math.round(result);
    setBmr(v); onCalculate?.(v);
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
              <TabsTrigger value="imperial">lb / ft+in</TabsTrigger>
              <TabsTrigger value="metric">kg / cm</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button type="button" variant="ghost" size="sm" onClick={autoFill}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refill
          </Button>
        </div>

        {unit === "imperial" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Feet</Label>
              <Input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Inches</Label>
              <Input type="number" value={inches} onChange={(e) => setInches(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Weight (lb)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={calculateBMR} className="w-full bg-gradient-primary">Calculate BMR</Button>

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
