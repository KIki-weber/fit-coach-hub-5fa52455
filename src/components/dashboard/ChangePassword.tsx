import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";

export const ChangePassword = () => {
  const { toast } = useToast();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters.", variant: "destructive" });
      return;
    }
    if (pwd !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Password updated" });
      setPwd(""); setConfirm("");
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change Password</CardTitle>
        <CardDescription>Update the password you use to log in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="np">New password</Label>
            <Input id="np" type="password" minLength={6} value={pwd} onChange={(e) => setPwd(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp">Confirm password</Label>
            <Input id="cp" type="password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="bg-gradient-primary">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
