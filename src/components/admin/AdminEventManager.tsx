import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Trash2, Edit, Plus } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  content: string;
  event_date: string | null;
  event_time: string | null;
  created_at: string;
}

export const AdminEventManager = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    event_date: "",
    event_time: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (editingEvent) {
      const { error } = await supabase
        .from("events")
        .update({
          ...formData,
          event_date: formData.event_date || null,
          event_time: formData.event_time || null,
        })
        .eq("id", editingEvent.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update event",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
        resetForm();
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from("events").insert({
        ...formData,
        created_by: session.user.id,
        event_date: formData.event_date || null,
        event_time: formData.event_time || null,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create event",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Event posted successfully",
        });
        resetForm();
        fetchEvents();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      fetchEvents();
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      content: event.content,
      event_date: event.event_date || "",
      event_time: event.event_time || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      event_date: "",
      event_time: "",
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Health Events & Tips
            </CardTitle>
            <CardDescription>Post wellness events and health tips for your clients</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Event</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-secondary/30 rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Full Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time">Event Time</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editingEvent ? "Update Event" : "Post Event"}
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No events posted yet.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="p-4 bg-secondary/30 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mb-2">{event.content}</p>
                {(event.event_date || event.event_time) && (
                  <div className="text-xs text-muted-foreground">
                    {event.event_date && `Date: ${new Date(event.event_date).toLocaleDateString()}`}
                    {event.event_time && ` • Time: ${event.event_time}`}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  Posted: {new Date(event.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
