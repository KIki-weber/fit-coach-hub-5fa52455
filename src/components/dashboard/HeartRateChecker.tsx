import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart, Activity } from "lucide-react";

interface Props { age?: number | null }

export const HeartRateChecker = ({ age }: Props) => {
  const [bpm, setBpm] = useState("");
  const [ageInput, setAgeInput] = useState(age ? String(age) : "");
  const [result, setResult] = useState<null | {
    status: string; color: string; max: number; targetLow: number; targetHigh: number;
  }>(null);

  const check = () => {
    const b = parseInt(bpm);
    const a = parseInt(ageInput);
    if (isNaN(b) || isNaN(a) || a < 1) return;
    const max = 220 - a;
    const targetLow = Math.round(max * 0.5);
    const targetHigh = Math.round(max * 0.85);

    let status = "Normal resting";
    let color = "text-green-500";
    if (b < 60) { status = "Low (bradycardia) — consult a doctor if symptomatic"; color = "text-yellow-500"; }
    else if (b > 100 && b < targetLow) { status = "Elevated resting"; color = "text-yellow-500"; }
    else if (b >= targetLow && b <= targetHigh) { status = "In aerobic target zone"; color = "text-primary"; }
    else if (b > targetHigh && b <= max) { status = "Anaerobic / peak zone"; color = "text-orange-500"; }
    else if (b > max) { status = "Above predicted max — slow down!"; color = "text-destructive"; }

    setResult({ status, color, max, targetLow, targetHigh });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-destructive" />
          Heart Rate Checker
        </CardTitle>
        <CardDescription>
          Enter your current pulse (beats/minute) and age. We'll show your safe target zones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bpm">Heart rate (bpm)</Label>
            <Input id="bpm" type="number" min="30" max="250" value={bpm}
              onChange={(e) => setBpm(e.target.value)} placeholder="e.g. 72" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min="1" max="120" value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)} placeholder="e.g. 30" />
          </div>
        </div>
        <Button onClick={check} className="bg-gradient-primary">
          <Activity className="w-4 h-4 mr-2" /> Analyze
        </Button>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-secondary/40 border border-border space-y-2">
            <p className={`text-lg font-semibold ${result.color}`}>{result.status}</p>
            <div className="text-sm text-muted-foreground grid grid-cols-3 gap-2">
              <div>Max HR: <span className="font-medium text-foreground">{result.max}</span></div>
              <div>Target low (50%): <span className="font-medium text-foreground">{result.targetLow}</span></div>
              <div>Target high (85%): <span className="font-medium text-foreground">{result.targetHigh}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Educational guidance only — not medical advice. Consult a professional for persistent abnormal readings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
