import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
  age: number | null;
  height: number | null;
  height_unit: string | null;
  weight: number | null;
  weight_unit: string | null;
  photo_url: string | null;
  exercise_plan: string | null;
}

export const AdminScheduleManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [scheduleData, setScheduleData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);

  const uploadPdf = async (): Promise<string | null> => {
    if (!pdfFile) return null;
    const ext = pdfFile.name.split(".").pop() || "pdf";
    const path = `schedules/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("plan-pdfs").upload(path, pdfFile, { contentType: pdfFile.type || "application/pdf" });
    if (error) {
      toast({ title: "PDF upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("plan-pdfs").getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, age, height, height_unit, weight, weight_unit, photo_url, exercise_plan")
      .order("full_name");

    if (data) {
      setUsers(data as any);
    }
  };

  const selected = users.find(u => u.user_id === selectedUser);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast({
        title: "Select a user",
        description: "Please select a user to assign this schedule.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (selectedUser === "all") {
      // Send to all users
      const schedules = users.map(user => ({
        user_id: user.user_id,
        title: scheduleData.title,
        description: scheduleData.description,
        date: scheduleData.date,
        time: scheduleData.time,
        created_by: session?.user.id,
      }));

      const { error } = await supabase.from("schedules").insert(schedules);

      if (error) {
        toast({
          title: "Failed to create schedules",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Schedules Created",
          description: `Training schedule sent to all ${users.length} users successfully.`,
        });
        setScheduleData({ title: "", description: "", date: "", time: "" });
        setSelectedUser("");
      }
    } else {
      // Send to single user
      const { error } = await supabase.from("schedules").insert({
        user_id: selectedUser,
        title: scheduleData.title,
        description: scheduleData.description,
        date: scheduleData.date,
        time: scheduleData.time || null,
        created_by: session?.user.id,
      });

      if (error) {
        toast({
          title: "Failed to create schedule",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Schedule Created",
          description: "Training schedule has been sent to the user.",
        });
        setScheduleData({ title: "", description: "", date: "", time: "" });
        setSelectedUser("");
      }
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Schedule Manager
        </CardTitle>
        <CardDescription>Create training schedules for users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <div className="p-4 bg-muted/40 rounded-lg border border-border flex gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={selected.photo_url || undefined} />
                <AvatarFallback>{selected.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm">
                <p className="font-semibold">{selected.full_name || selected.email}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-muted-foreground">
                  <div>Age: <span className="text-foreground font-medium">{selected.age ?? "N/A"}</span></div>
                  <div>Height: <span className="text-foreground font-medium">{selected.height ? `${selected.height} ${selected.height_unit || 'cm'}` : "N/A"}</span></div>
                  <div>Weight: <span className="text-foreground font-medium">{selected.weight ? `${selected.weight} ${selected.weight_unit || 'kg'}` : "N/A"}</span></div>
                  <div>Plan: <span className="text-foreground font-medium">{selected.exercise_plan || "N/A"}</span></div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="schedule-title">Title</Label>
            <Input
              id="schedule-title"
              value={scheduleData.title}
              onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
              placeholder="Morning Cardio Session"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-description">Description</Label>
            <Textarea
              id="schedule-description"
              value={scheduleData.description}
              onChange={(e) => setScheduleData({ ...scheduleData, description: e.target.value })}
              placeholder="Details about the training session..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduleData.date}
                onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Time (optional)</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduleData.time}
                onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
