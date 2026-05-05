import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BMICalculatorProps {
  onCalculate?: (bmi: number) => void;
}

type Unit = "metric" | "imperial";

export const BMICalculator = ({ onCalculate }: BMICalculatorProps) => {
  const [unit, setUnit] = useState<Unit>("imperial");
  const [heightCm, setHeightCm] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  useEffect(() => { autoFill(); }, []);

  const autoFill = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("profiles")
      .select("height, weight, height_unit, weight_unit")
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
        const inLeft = +(totalIn - ft * 12).toFixed(1);
        setFeet(String(ft));
        setInches(String(inLeft));
      } else {
        setHeightCm(String(cm));
      }
    }
    if (data.weight) {
      setWeight(useImperial ? (Number(data.weight) * 2.20462).toFixed(1) : String(data.weight));
    }
  };

  const calculateBMI = () => {
    const w = parseFloat(weight);
    if (!(w > 0)) return;
    let totalIn = 0, cm = 0;
    if (unit === "imperial") {
      totalIn = (parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0);
      if (totalIn <= 0) return;
      const result = 703 * w / (totalIn * totalIn);
      const v = Math.round(result * 10) / 10;
      setBmi(v); onCalculate?.(v);
    } else {
      cm = parseFloat(heightCm);
      if (!(cm > 0)) return;
      const m = cm / 100;
      const result = w / (m * m);
      const v = Math.round(result * 10) / 10;
      setBmi(v); onCalculate?.(v);
    }
  };

  const getBMICategory = (b: number) => {
    if (b < 18.5) return { text: "Underweight", color: "text-yellow-600" };
    if (b < 25) return { text: "Normal", color: "text-primary" };
    if (b < 30) return { text: "Overweight", color: "text-orange-600" };
    return { text: "Obese", color: "text-destructive" };
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          BMI Calculator
        </CardTitle>
        <CardDescription>Body Mass Index — auto-filled from your profile</CardDescription>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Feet</Label>
              <Input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} placeholder="5" />
            </div>
            <div className="space-y-2">
              <Label>Inches</Label>
              <Input type="number" value={inches} onChange={(e) => setInches(e.target.value)} placeholder="7" />
            </div>
            <div className="space-y-2">
              <Label>Weight (lb)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="154" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="170" />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
            </div>
          </div>
        )}

        <Button onClick={calculateBMI} className="w-full bg-gradient-primary">Calculate BMI</Button>

        {bmi !== null && (
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{bmi}</div>
            <div className={`text-lg font-semibold ${getBMICategory(bmi).color}`}>
              {getBMICategory(bmi).text}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
