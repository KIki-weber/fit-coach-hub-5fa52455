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
    }
  }, [userId]);

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
    
    const { error } = await supabase
      .from("progress_tracking")
      .insert({
        user_id: userId,
        photo_url: formData.photoUrl || null,
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
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Enter height"
                  />
                  <Select value={formData.heightUnit} onValueChange={(v) => setFormData({ ...formData, heightUnit: v })}>
                    <SelectTrigger className="w-24">
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
                <Label>Weight</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Enter weight"
                  />
                  <Select value={formData.weightUnit} onValueChange={(v) => setFormData({ ...formData, weightUnit: v })}>
                    <SelectTrigger className="w-24">
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

            <div className="space-y-2">
              <Label>Progress Photo</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
                {formData.photoUrl && (
                  <img src={formData.photoUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="How are you feeling? Any milestones?"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading}>
                Save Progress
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Weight Progress Over Time
                </h4>
                <ResponsiveContainer width="100%" height={250}>
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
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={['auto', 'auto']} className="text-xs" />
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
            )}

            {/* Progress Entries Grid */}
            <div className="grid gap-4">
              {entries.map((entry) => (
                <div key={entry.id} className="flex gap-4 p-4 border rounded-lg">
                  {entry.photo_url && (
                    <img
                      src={entry.photo_url}
                      alt="Progress"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), "PPP 'at' p")}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm">
                            <strong>Height:</strong> {formatHeight(entry.height, entry.height_unit)}
                          </span>
                          <span className="text-sm">
                            <strong>Weight:</strong> {formatWeight(entry.weight, entry.weight_unit)}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
