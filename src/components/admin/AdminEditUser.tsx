import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  user: any;
  onSaved: () => void;
}

export const AdminEditUser = ({ open, onClose, user, onSaved }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    age: user?.age || "",
    gender: user?.gender || "",
    height: user?.height || "",
    height_unit: user?.height_unit || "cm",
    weight: user?.weight || "",
    weight_unit: user?.weight_unit || "kg",
    exercise_plan: user?.exercise_plan || "",
  });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name || null,
      phone_number: form.phone_number || null,
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      height: form.height ? Number(form.height) : null,
      height_unit: form.height_unit,
      weight: form.weight ? Number(form.weight) : null,
      weight_unit: form.weight_unit,
      exercise_plan: form.exercise_plan || null,
    }).eq("user_id", user.user_id);
    setSaving(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User updated" });
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user?.email}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Phone</Label>
            <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Age</Label>
            <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Height</Label>
            <Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Height Unit</Label>
            <Select value={form.height_unit} onValueChange={(v) => setForm({ ...form, height_unit: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="in">inch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Weight</Label>
            <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Weight Unit</Label>
            <Select value={form.weight_unit} onValueChange={(v) => setForm({ ...form, weight_unit: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lb">lb</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Exercise Plan</Label>
            <Select value={form.exercise_plan} onValueChange={(v) => setForm({ ...form, exercise_plan: v })}>
              <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="weight_gain">Weight Gain</SelectItem>
                <SelectItem value="muscle_building">Muscle Building</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="general_fitness">General Fitness</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-primary">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
