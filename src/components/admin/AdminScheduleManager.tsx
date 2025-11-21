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

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
}

export const AdminScheduleManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [scheduleData, setScheduleData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .order("full_name");

    if (data) {
      setUsers(data);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast({
        title: "Select a user",
        description: "Please select a user to assign this schedule to.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

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
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
