import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  content: string;
  event_date: string | null;
  event_time: string | null;
  created_at: string;
}

export const EventsView = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setEvents(data);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Health Events & Tips
        </CardTitle>
        <CardDescription>Latest wellness events and health tips from your coach</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No events available yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="p-4 bg-secondary/30 rounded-lg border border-border">
                <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                )}
                <p className="text-sm text-foreground/80 mb-3">{event.content}</p>
                {(event.event_date || event.event_time) && (
                  <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                    <Calendar className="w-4 h-4" />
                    {event.event_date && new Date(event.event_date).toLocaleDateString()}
                    {event.event_time && ` at ${event.event_time}`}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Posted: {new Date(event.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
