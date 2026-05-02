import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart, Activity, Bluetooth, BluetoothOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props { age?: number | null }

export const HeartRateChecker = ({ age }: Props) => {
  const { toast } = useToast();
  const [bpm, setBpm] = useState("");
  const [ageInput, setAgeInput] = useState(age ? String(age) : "");
  const [result, setResult] = useState<null | {
    status: string; color: string; max: number; targetLow: number; targetHigh: number;
  }>(null);
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [liveBpm, setLiveBpm] = useState<number | null>(null);
  const deviceRef = useRef<any>(null);
  const charRef = useRef<any>(null);

  const analyze = (b: number, a: number) => {
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

  const check = () => analyze(parseInt(bpm), parseInt(ageInput));

  const parseHR = (value: DataView) => {
    const flags = value.getUint8(0);
    const rate16 = (flags & 0x1) === 1;
    return rate16 ? value.getUint16(1, true) : value.getUint8(1);
  };

  const connectSmartwatch = async () => {
    const nav: any = navigator;
    if (!nav.bluetooth) {
      toast({
        title: "Bluetooth not supported",
        description: "Use Chrome, Edge, or Opera on desktop/Android. iOS Safari does not support Web Bluetooth — enter your reading manually instead.",
        variant: "destructive",
      });
      return;
    }
    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["battery_service"],
      });
      deviceRef.current = device;
      setDeviceName(device.name || "Heart Rate Monitor");
      device.addEventListener("gattserverdisconnected", () => {
        setConnected(false);
        setLiveBpm(null);
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("heart_rate");
      const char = await service.getCharacteristic("heart_rate_measurement");
      charRef.current = char;
      await char.startNotifications();
      char.addEventListener("characteristicvaluechanged", (e: any) => {
        const hr = parseHR(e.target.value);
        setLiveBpm(hr);
        setBpm(String(hr));
        const a = parseInt(ageInput);
        if (!isNaN(a)) analyze(hr, a);
      });
      setConnected(true);
      toast({ title: "Connected", description: `Receiving live heart rate from ${device.name || "device"}.` });
    } catch (e: any) {
      toast({ title: "Connection failed", description: e?.message || "Could not connect to device", variant: "destructive" });
    }
  };

  const disconnect = () => {
    try {
      if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect();
    } catch {}
    setConnected(false);
    setLiveBpm(null);
    setDeviceName(null);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-destructive" />
          Heart Rate Checker
        </CardTitle>
        <CardDescription>
          Connect your smartwatch / chest strap, or enter your pulse manually. We'll show your safe target zones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg border bg-secondary/30 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Bluetooth className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Smartwatch / Heart Rate Monitor</span>
            </div>
            {!connected ? (
              <Button size="sm" onClick={connectSmartwatch} className="bg-gradient-primary">
                <Bluetooth className="w-4 h-4 mr-2" /> Connect Device
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={disconnect}>
                <BluetoothOff className="w-4 h-4 mr-2" /> Disconnect
              </Button>
            )}
          </div>
          {connected && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{deviceName}</span>
              <span className="text-2xl font-bold text-primary flex items-center gap-2">
                <Heart className="w-5 h-5 animate-pulse" />
                {liveBpm ?? "--"} <span className="text-xs text-muted-foreground">bpm</span>
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Works on Chrome / Edge / Opera (desktop & Android). iOS doesn't allow Web Bluetooth — use manual entry below.
          </p>
        </div>

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
