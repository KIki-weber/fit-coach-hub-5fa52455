import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface BMICalculatorProps {
  onCalculate?: (bmi: number) => void;
}

export const BMICalculator = ({ onCalculate }: BMICalculatorProps) => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // convert cm to m
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const result = w / (h * h);
      const calculatedBMI = Math.round(result * 10) / 10;
      setBmi(calculatedBMI);
      onCalculate?.(calculatedBMI);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "text-yellow-600" };
    if (bmi < 25) return { text: "Normal", color: "text-green-600" };
    if (bmi < 30) return { text: "Overweight", color: "text-orange-600" };
    return { text: "Obese", color: "text-red-600" };
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          BMI Calculator
        </CardTitle>
        <CardDescription>Body Mass Index - Track your body composition</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmi-height">Height (cm)</Label>
            <Input
              id="bmi-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmi-weight">Weight (kg)</Label>
            <Input
              id="bmi-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </div>
        </div>

        <Button onClick={calculateBMI} className="w-full bg-gradient-primary">
          Calculate BMI
        </Button>

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
