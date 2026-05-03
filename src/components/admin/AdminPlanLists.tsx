import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Save, X, FileText, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface UserMap { [id: string]: { full_name: string; email: string } }

const useUserMap = () => {
  const [map, setMap] = useState<UserMap>({});
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, email");
      const m: UserMap = {};
      data?.forEach((p: any) => { m[p.user_id] = { full_name: p.full_name, email: p.email }; });
      setMap(m);
    })();
  }, []);
  return map;
};

export const AdminNutritionList = ({ refreshKey }: { refreshKey?: number }) => {
  const { toast } = useToast();
  const userMap = useUserMap();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("nutrition").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setItems(data || []);
  };

  useEffect(() => { load(); }, [refreshKey]);

  const remove = async (id: string) => {
    if (!confirm("Delete this nutrition plan?")) return;
    const { error } = await supabase.from("nutrition").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); load(); }
  };

  const save = async () => {
    if (!editing) return;
    const { id, title, description, protein, calories, carbs, fats, vitamins, notes } = editing;
    const { error } = await supabase.from("nutrition").update({
      title, description, vitamins, notes,
      protein: protein ? parseFloat(protein) : null,
      calories: calories ? parseFloat(calories) : null,
      carbs: carbs ? parseFloat(carbs) : null,
      fats: fats ? parseFloat(fats) : null,
    }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated" }); setEditing(null); load(); }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Created Nutrition Plans</CardTitle>
        <CardDescription>Edit or delete plans you've sent to users</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No nutrition plans yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p.id} className="p-3 border rounded-lg bg-secondary/30 flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userMap[p.user_id]?.full_name || userMap[p.user_id]?.email || p.user_id.slice(0, 8)}
                    {" • "}{new Date(p.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                    {p.calories && <span>🔥 {p.calories}kcal</span>}
                    {p.protein && <span>🥩 {p.protein}g</span>}
                    {p.pdf_url && <a href={p.pdf_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1"><FileText className="w-3 h-3" />PDF</a>}
                    {p.image_url && <a href={p.image_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" />Image</a>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing({ ...p })}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Nutrition Plan</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Calories</Label><Input type="number" value={editing.calories || ""} onChange={(e) => setEditing({ ...editing, calories: e.target.value })} /></div>
                <div><Label>Protein (g)</Label><Input type="number" value={editing.protein || ""} onChange={(e) => setEditing({ ...editing, protein: e.target.value })} /></div>
                <div><Label>Carbs (g)</Label><Input type="number" value={editing.carbs || ""} onChange={(e) => setEditing({ ...editing, carbs: e.target.value })} /></div>
                <div><Label>Fats (g)</Label><Input type="number" value={editing.fats || ""} onChange={(e) => setEditing({ ...editing, fats: e.target.value })} /></div>
              </div>
              <div><Label>Vitamins</Label><Input value={editing.vitamins || ""} onChange={(e) => setEditing({ ...editing, vitamins: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}><X className="w-4 h-4 mr-1" />Cancel</Button>
            <Button onClick={save} className="bg-gradient-primary"><Save className="w-4 h-4 mr-1" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const AdminScheduleList = ({ refreshKey }: { refreshKey?: number }) => {
  const { toast } = useToast();
  const userMap = useUserMap();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("schedules").select("*").order("date", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setItems(data || []);
  };

  useEffect(() => { load(); }, [refreshKey]);

  const remove = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); load(); }
  };

  const save = async () => {
    if (!editing) return;
    const { id, title, description, date, time } = editing;
    const { error } = await supabase.from("schedules").update({
      title, description, date, time: time || null,
    }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated" }); setEditing(null); load(); }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Created Schedules</CardTitle>
        <CardDescription>Edit or delete schedules you've sent to users</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No schedules yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="p-3 border rounded-lg bg-secondary/30 flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userMap[s.user_id]?.full_name || userMap[s.user_id]?.email || s.user_id.slice(0, 8)}
                    {" • "}{s.date}{s.time ? ` ${s.time}` : ""}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap text-xs">
                    {s.pdf_url && <a href={s.pdf_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1"><FileText className="w-3 h-3" />PDF</a>}
                    {s.image_url && <a href={s.image_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" />Image</a>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing({ ...s })}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Schedule</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={editing.date || ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
                <div><Label>Time</Label><Input type="time" value={editing.time || ""} onChange={(e) => setEditing({ ...editing, time: e.target.value })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}><X className="w-4 h-4 mr-1" />Cancel</Button>
            <Button onClick={save} className="bg-gradient-primary"><Save className="w-4 h-4 mr-1" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
