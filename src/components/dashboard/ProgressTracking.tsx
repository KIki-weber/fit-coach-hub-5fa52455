import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Plus, Trash2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProgressEntry {
  id: string;
  photo_url: string | null;
  previous_photo_url: string | null;
  height: number | null;
  height_unit: string;
  weight: number | null;
  weight_unit: string;
  notes: string | null;
  created_at: string;
}

interface ProgressTrackingProps {
  userId: string;
}

export const ProgressTracking = ({ userId }: ProgressTrackingProps) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    height: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
    notes: "",
    photoUrl: ""
  });

  useEffect(() => {
    if (userId) {
      fetchEntries();
      autoFillFromProfile();
    }
  }, [userId]);

  const autoFillFromProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("height, weight, height_unit, weight_unit")
      .eq("user_id", userId)
      .single();
    if (!data) return;
    const hUnit = (data as any).height_unit || "cm";
    const wUnit = (data as any).weight_unit || "kg";
    // DB stores cm/kg — convert to selected unit for display
    let h = "";
    if (data.height) {
      h = hUnit === "in" ? (Number(data.height) / 2.54).toFixed(1) : String(data.height);
    }
    let w = "";
    if (data.weight) {
      w = wUnit === "lb" ? (Number(data.weight) * 2.20462).toFixed(1) : String(data.weight);
    }
    setFormData((prev) => ({
      ...prev,
      height: prev.height || h,
      heightUnit: hUnit === "in" ? "inch" : "cm",
      weight: prev.weight || w,
      weightUnit: wUnit,
    }));
  };

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("progress_tracking")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching progress:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("progress-photos")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from("progress-photos")
        .getPublicUrl(fileName);
      
      setFormData({ ...formData, photoUrl: publicUrl });
      toast({
        title: "Photo uploaded",
        description: "Your progress photo has been uploaded.",
      });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The "previous" photo is the most recent existing entry's current photo
    const previous_photo_url = entries[0]?.photo_url || null;

    const { error } = await supabase
      .from("progress_tracking")
      .insert({
        user_id: userId,
        photo_url: formData.photoUrl || null,
        previous_photo_url,
        height: formData.height ? parseFloat(formData.height) : null,
        height_unit: formData.heightUnit,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weight_unit: formData.weightUnit,
        notes: formData.notes || null,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save progress entry.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Progress saved",
        description: "Your progress has been recorded.",
      });
      setFormData({
        height: "",
        heightUnit: "cm",
        weight: "",
        weightUnit: "kg",
        notes: "",
        photoUrl: ""
      });
      setShowForm(false);
      fetchEntries();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("progress_tracking")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Progress entry removed.",
      });
      fetchEntries();
    }
  };

  const formatHeight = (height: number | null, unit: string) => {
    if (!height) return "N/A";
    return `${height} ${unit}`;
  };

  const formatWeight = (weight: number | null, unit: string) => {
    if (!weight) return "N/A";
    return `${weight} ${unit}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading progress...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Progress Tracking
        </CardTitle>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Entry
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-3 sm:p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Height</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Height"
                    className="text-sm"
                  />
                  <Select value={formData.heightUnit} onValueChange={(v) => setFormData({ ...formData, heightUnit: v })}>
                    <SelectTrigger className="w-20 sm:w-24 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="inch">inch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Weight</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Weight"
                    className="text-sm"
                  />
                  <Select value={formData.weightUnit} onValueChange={(v) => setFormData({ ...formData, weightUnit: v })}>
                    <SelectTrigger className="w-20 sm:w-24 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2 min-w-0">
                <Label className="text-sm">Previous Photo (auto)</Label>
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  {entries[0]?.photo_url ? (
                    <img src={entries[0].photo_url} alt="Previous" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground p-2 text-center">No previous photo yet</span>
                  )}
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <Label className="text-sm">New Current Photo</Label>
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center relative">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground p-2 text-center">Upload below</span>
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="How are you feeling? Any milestones?"
                className="text-sm resize-none"
              />
            </div>

            <div className="flex gap-2 flex-col sm:flex-row">
              <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                Save Progress
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        )}

        {entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No progress entries yet. Start tracking your journey!
          </p>
        ) : (
          <div className="space-y-6">
            {/* Weight Progress Chart */}
            {entries.filter(e => e.weight).length > 1 && (
              <div className="p-3 sm:p-4 border rounded-lg bg-muted/30">
                <h4 className="font-semibold flex items-center gap-2 mb-4 text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Weight Progress Over Time
                </h4>
                <div className="-mx-3 sm:-mx-4 overflow-x-auto">
                  <div className="min-w-full" style={{minWidth: '100%', width: '100%'}}>
                  <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={[...entries]
                      .filter(e => e.weight)
                      .reverse()
                      .map(e => ({
                        date: format(new Date(e.created_at), "MMM dd"),
                        weight: e.weight_unit === "lb" ? Number((e.weight! * 0.453592).toFixed(1)) : e.weight,
                        originalWeight: e.weight,
                        unit: e.weight_unit
                      }))}
                    margin={{ top: 10, right: 12, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" className="text-[11px]" tick={{fontSize: 11}} />
                    <YAxis domain={['auto', 'auto']} className="text-[11px]" tick={{fontSize: 11}} width={35} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number, name: string, props: any) => [
                        `${props.payload.originalWeight} ${props.payload.unit}`,
                        'Weight'
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      name="Weight (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Entries Grid */}
            <div className="grid gap-3 sm:gap-4">
              {entries.map((entry, idx) => {
                const prevEntry = entries[idx + 1];
                const wDelta = (entry.weight != null && prevEntry?.weight != null)
                  ? +(Number(entry.weight) - Number(prevEntry.weight)).toFixed(1)
                  : null;
                return (
                <div key={entry.id} className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <div className="flex-shrink-0 w-20 sm:w-24">
                      <p className="text-[9px] sm:text-[10px] uppercase text-muted-foreground mb-1">Previous</p>
                      <div className="w-20 sm:w-24 aspect-square h-20 sm:h-24 rounded-lg overflow-hidden bg-muted">
                        {entry.previous_photo_url ? (
                          <img src={entry.previous_photo_url} alt="Previous" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground text-center px-1">No previous</div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-20 sm:w-24">
                      <p className="text-[9px] sm:text-[10px] uppercase text-muted-foreground mb-1">Now</p>
                      <div className="w-20 sm:w-24 aspect-square h-20 sm:h-24 rounded-lg overflow-hidden bg-muted">
                        {entry.photo_url ? (
                          <img src={entry.photo_url} alt="Now" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">No photo</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                          {format(new Date(entry.created_at), "PPP 'at' p")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                          <span className="truncate">
                            <strong>Height:</strong> {formatHeight(entry.height, entry.height_unit)}
                          </span>
                          <span className="truncate">
                            <strong>Weight:</strong> {formatWeight(entry.weight, entry.weight_unit)}
                          </span>
                        </div>
                        {wDelta != null && (
                          <p className="text-xs sm:text-sm mt-1">
                            <strong>Change:</strong>{" "}
                            <span className={wDelta < 0 ? "text-primary" : wDelta > 0 ? "text-destructive" : ""}>
                              {wDelta > 0 ? "+" : ""}{wDelta} {entry.weight_unit}
                            </span>{" "}
                            since previous
                          </p>
                        )}
                        {entry.notes && (
                          <p className="text-xs sm:text-sm mt-2 text-muted-foreground line-clamp-2">{entry.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
