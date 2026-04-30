import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Mail } from "lucide-react";

interface UserOption { user_id: string; full_name: string; email: string }

export const AdminPasswordReset = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [target, setTarget] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("user_id, full_name, email").order("full_name")
      .then(({ data }) => data && setUsers(data));
  }, []);

  const setNewPassword = async () => {
    if (!target || pwd.length < 6) {
      toast({ title: "Pick a user and a password (≥6 chars)", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-update-user-password", {
      body: { target_user_id: target, new_password: pwd },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast({ title: "Failed", description: error?.message || (data as any)?.error, variant: "destructive" });
    } else {
      const userEmail = users.find(u => u.user_id === target)?.email;
      toast({
        title: "Password updated",
        description: `Share with the user securely: ${userEmail} → ${pwd}`,
      });
      setPwd("");
    }
  };

  const sendResetLink = async () => {
    const userEmail = users.find(u => u.user_id === target)?.email;
    if (!userEmail) { toast({ title: "Pick a user first", variant: "destructive" }); return; }
    setLinkLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLinkLoading(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else toast({ title: "Reset link sent", description: `Check ${userEmail}'s inbox.` });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Update User Password</CardTitle>
        <CardDescription>Set a new password directly, or send the user a reset email link (valid ~20 min).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>User</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger><SelectValue placeholder="Choose a user…" /></SelectTrigger>
            <SelectContent>
              {users.map(u => (
                <SelectItem key={u.user_id} value={u.user_id}>{u.full_name || u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="np">New password</Label>
            <Input id="np" type="text" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="min 6 chars" />
            <Button onClick={setNewPassword} disabled={loading} className="bg-gradient-primary w-full">
              {loading ? "Updating…" : "Set password now"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Or send a reset link</Label>
            <p className="text-xs text-muted-foreground">User picks their own password via email link.</p>
            <Button variant="outline" onClick={sendResetLink} disabled={linkLoading} className="w-full">
              <Mail className="w-4 h-4 mr-2" /> {linkLoading ? "Sending…" : "Send reset email"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
