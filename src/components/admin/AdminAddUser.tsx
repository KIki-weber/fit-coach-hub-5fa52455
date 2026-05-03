import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail } from "lucide-react";

const PLANS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "weight_gain", label: "Weight Gain" },
  { value: "muscle_building", label: "Muscle Building" },
  { value: "endurance", label: "Endurance" },
  { value: "general_fitness", label: "General Fitness" },
];

export const AdminAddUser = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", full_name: "", phone_number: "",
    exercise_plan: "", gender: "",
  });

  const submit = async (mode: "invite" | "create") => {
    if (!form.email) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    if (mode === "create" && form.password.length < 6) {
      toast({ title: "Password must be ≥ 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: { ...form, mode },
    });
    if (error || (data as any)?.error) {
      const msg = (data as any)?.error || error?.message || "Unknown error";
      toast({ title: "Failed to add user", description: msg, variant: "destructive" });
      console.error("admin-create-user failed:", { error, data });
    } else {
      toast({
        title: mode === "invite" ? "Invitation sent" : "User created",
        description: mode === "invite"
          ? `An invite email was sent to ${form.email}.`
          : `${form.email} can log in immediately with the password you set.`,
      });
      setForm({ email: "", password: "", full_name: "", phone_number: "", exercise_plan: "", gender: "" });
      window.dispatchEvent(new CustomEvent("admin:user-added"));
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Add a New User
        </CardTitle>
        <CardDescription>Send an invitation OR create an account directly with a password.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="create">Create directly</TabsTrigger>
            <TabsTrigger value="invite">Send invite</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Exercise Plan</Label>
              <Select value={form.exercise_plan} onValueChange={(v) => setForm({ ...form, exercise_plan: v })}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="text" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters" />
              <p className="text-xs text-muted-foreground">
                Share this password with the user — they can log in immediately and update their profile.
              </p>
            </div>
            <Button onClick={() => submit("create")} disabled={loading} className="bg-gradient-primary w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" /> {loading ? "Creating..." : "Create User"}
            </Button>
          </TabsContent>

          <TabsContent value="invite" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              The user will receive an email invitation and set their own password.
            </p>
            <Button onClick={() => submit("invite")} disabled={loading} className="bg-gradient-primary w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" /> {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
