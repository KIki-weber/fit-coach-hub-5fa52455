import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Activity, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface Row {
  user_id: string;
  full_name: string | null;
  email: string | null;
  progress_public: boolean;
  latest?: {
    photo_url: string | null;
    previous_photo_url: string | null;
    weight: number | null;
    weight_unit: string | null;
    height: number | null;
    height_unit: string | null;
    notes: string | null;
    created_at: string;
  };
  prevWeight?: number | null;
}

export const AdminProgressManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, progress_public");
    if (!profiles) { setLoading(false); return; }

    const { data: progress } = await supabase
      .from("progress_tracking")
      .select("*")
      .order("created_at", { ascending: false });

    const grouped = new Map<string, any[]>();
    (progress || []).forEach((p: any) => {
      const arr = grouped.get(p.user_id) || [];
      arr.push(p);
      grouped.set(p.user_id, arr);
    });

    const merged: Row[] = profiles
      .map((p: any) => {
        const list = grouped.get(p.user_id) || [];
        return {
          user_id: p.user_id,
          full_name: p.full_name,
          email: p.email,
          progress_public: !!p.progress_public,
          latest: list[0],
          prevWeight: list[1]?.weight ?? null,
        };
      })
      .filter((r) => r.latest);
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePublic = async (userId: string, value: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ progress_public: value })
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: value ? "Activated" : "Deactivated",
        description: value
          ? "Progress is now visible on the Our Trainers section."
          : "Progress is hidden from the public page.",
      });
      setRows((rs) => rs.map((r) => r.user_id === userId ? { ...r, progress_public: value } : r));
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6 text-muted-foreground">Loading progress…</CardContent></Card>;
  }

  if (rows.length === 0) {
    return <Card><CardContent className="p-6 text-muted-foreground">No user progress entries yet.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const w = r.latest?.weight;
        const pw = r.prevWeight;
        const delta = (w != null && pw != null) ? +(Number(w) - Number(pw)).toFixed(1) : null;
        return (
          <Card key={r.user_id} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-4 h-4 text-primary" />
                  {r.full_name || "Unnamed"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{r.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {r.progress_public ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                <Label htmlFor={`pub-${r.user_id}`} className="text-sm">
                  {r.progress_public ? "Active on public page" : "Hidden (deactivated)"}
                </Label>
                <Switch
                  id={`pub-${r.user_id}`}
                  checked={r.progress_public}
                  onCheckedChange={(v) => togglePublic(r.user_id, v)}
                />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-1">Previous</p>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {r.latest?.previous_photo_url ? (
                    <img src={r.latest.previous_photo_url} alt="Previous" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No previous photo</div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-1">Current</p>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {r.latest?.photo_url ? (
                    <img src={r.latest.photo_url} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No photo</div>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Updated:</strong> {r.latest && format(new Date(r.latest.created_at), "PPP")}</p>
                <p><strong>Height:</strong> {r.latest?.height ? `${r.latest.height} ${r.latest.height_unit}` : "—"}</p>
                <p><strong>Weight:</strong> {w != null ? `${w} ${r.latest?.weight_unit}` : "—"}</p>
                {delta != null && (
                  <p>
                    <strong>Change since previous:</strong>{" "}
                    <span className={delta < 0 ? "text-primary" : delta > 0 ? "text-destructive" : ""}>
                      {delta > 0 ? "+" : ""}{delta} {r.latest?.weight_unit}
                    </span>
                  </p>
                )}
                {r.latest?.notes && (
                  <p className="text-muted-foreground"><strong>Notes:</strong> {r.latest.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
