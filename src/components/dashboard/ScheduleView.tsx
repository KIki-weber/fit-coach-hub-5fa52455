import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface Schedule {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
}

interface ScheduleViewProps {
  userId: string;
}

export const ScheduleView = ({ userId }: ScheduleViewProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    fetchSchedules();
    
    // Subscribe to schedule changes
    const subscription = supabase
      .channel('schedules_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'schedules', filter: `user_id=eq.${userId}` },
        () => fetchSchedules()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchSchedules = async () => {
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (data) {
      setSchedules(data);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Your Training Schedule
        </CardTitle>
        <CardDescription>Upcoming training sessions from your coach</CardDescription>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No schedules yet. Your coach will add training sessions soon.
          </p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 bg-secondary/30 rounded-lg border border-border"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{schedule.title}</h4>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(schedule.date), "MMM dd, yyyy")}
                    {schedule.time && ` at ${schedule.time}`}
                  </span>
                </div>
                {schedule.description && (
                  <p className="text-muted-foreground">{schedule.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
