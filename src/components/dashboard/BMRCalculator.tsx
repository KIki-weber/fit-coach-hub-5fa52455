import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "lucide-react";

export const BMRCalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [bmr, setBmr] = useState<number | null>(null);

  const calculateBMR = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);

    if (h > 0 && w > 0 && a > 0) {
      let result;
      if (gender === "male") {
        result = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
      } else {
        result = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
      }
      setBmr(Math.round(result));
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          BMR Calculator
        </CardTitle>
        <CardDescription>Basal Metabolic Rate - Your daily calorie needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmr-height">Height (cm)</Label>
            <Input
              id="bmr-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-weight">Weight (kg)</Label>
            <Input
              id="bmr-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-age">Age</Label>
            <Input
              id="bmr-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
            />
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
