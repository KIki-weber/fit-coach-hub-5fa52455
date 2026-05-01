import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EventItem {
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
  const [events, setEvents] = useState<EventItem[]>([]);
  const [active, setActive] = useState<EventItem | null>(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setActive(event)}
                className="group text-left rounded-lg border border-border bg-card hover:shadow-smooth hover:border-primary/40 transition-all overflow-hidden"
              >
                {event.image_url ? (
                  <div className="relative h-44 overflow-hidden">
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-primary" />
                )}
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs pt-1">
                    {event.event_date ? (
                      <span className="inline-flex items-center gap-1 text-primary font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    ) : <span />}
                    <span className="inline-flex items-center gap-1 text-muted-foreground group-hover:text-primary">
                      Read more <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{active?.title}</DialogTitle>
            {active?.description && <DialogDescription>{active.description}</DialogDescription>}
          </DialogHeader>
          {active?.image_url && (
            <img src={active.image_url} alt={active.title} className="w-full max-h-[360px] object-cover rounded-lg" />
          )}
          {(active?.event_date || active?.event_time) && (
            <div className="flex flex-wrap gap-3 text-sm">
              {active?.event_date && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <Calendar className="w-4 h-4" /> {new Date(active.event_date).toLocaleDateString()}
                </span>
              )}
              {active?.event_time && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                  <Clock className="w-4 h-4" /> {active.event_time}
                </span>
              )}
            </div>
          )}
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{active?.content}</p>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
