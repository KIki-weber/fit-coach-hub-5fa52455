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
  image_url: string | null;
  created_at: string;
}

export const EventsView = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    supabase.from("events").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setEvents(data as any); });
  }, []);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Events from Coach Dave
        </CardTitle>
        <CardDescription>Latest wellness events and tips</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No events available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border border-border bg-secondary/20 overflow-hidden">
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className="w-full h-44 object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <p className="text-sm text-foreground/80">{event.content}</p>
                  {(event.event_date || event.event_time) && (
                    <div className="flex items-center gap-2 text-sm text-primary font-medium pt-1">
                      <Calendar className="w-4 h-4" />
                      {event.event_date && new Date(event.event_date).toLocaleDateString()}
                      {event.event_time && ` at ${event.event_time}`}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Posted: {new Date(event.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
