import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, KeyRound, Save } from "lucide-react";

export const AdminProfile = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase.from("profiles").select("full_name, phone_number").eq("user_id", user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone_number || "");
      }
    })();
  }, []);

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: fullName || null,
      phone_number: phone || null,
    }).eq("user_id", user.id);
    setLoading(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Min 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Password updated" });
      setNewPassword(""); setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Admin Profile</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={saveProfile} disabled={loading} className="bg-gradient-primary">
            <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change My Password</CardTitle>
          <CardDescription>Update your admin login password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <Button onClick={changePassword} disabled={pwLoading} className="bg-gradient-primary">
            {pwLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
