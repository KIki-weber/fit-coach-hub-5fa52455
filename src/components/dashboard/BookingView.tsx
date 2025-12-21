import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Dumbbell, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const SERVICE_TYPES = [
  { value: "personal_training", label: "Personal Training Session", duration: "60 min", price: "$75" },
  { value: "group_training", label: "Group Training Session", duration: "45 min", price: "$35" },
  { value: "nutrition_consult", label: "Nutrition Consultation", duration: "30 min", price: "$50" },
  { value: "fitness_assessment", label: "Fitness Assessment", duration: "45 min", price: "$40" },
  { value: "strength_coaching", label: "Strength & Conditioning", duration: "60 min", price: "$80" },
];

interface BookingViewProps {
  userId: string;
}

export const BookingView = ({ userId }: BookingViewProps) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    serviceType: "",
    notes: ""
  });

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("booking_date", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.serviceType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      booking_date: formData.date,
      booking_time: formData.time,
      service_type: formData.serviceType,
      notes: formData.notes || null,
      status: "pending"
    });

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been sent to Coach Dave for approval.",
      });
      setFormData({ date: "", time: "", serviceType: "", notes: "" });
      fetchBookings();
    }
    setSubmitting(false);
  };

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Cancel Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled.",
      });
      fetchBookings();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getServiceLabel = (value: string) => {
    return SERVICE_TYPES.find(s => s.value === value)?.label || value;
  };

  // Get tomorrow as minimum date
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Coach Info Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Coach Dave</h3>
              <p className="text-muted-foreground">Certified Personal Trainer & Nutrition Specialist</p>
              <p className="text-sm text-muted-foreground mt-1">10+ years experience | 500+ clients transformed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Book a Session
            </CardTitle>
            <CardDescription>Schedule a training session with Coach Dave</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(v) => setFormData({ ...formData, serviceType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        <div className="flex justify-between items-center w-full">
                          <span>{service.label}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            {service.duration} - {service.price}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={minDateStr}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    min="06:00"
                    max="20:00"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific goals or requests for this session..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Request Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              My Bookings
            </CardTitle>
            <CardDescription>Your upcoming and past sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No bookings yet. Book your first session with Coach Dave!
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg bg-secondary/30 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{getServiceLabel(booking.service_type)}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(booking.booking_date), "MMM dd, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.booking_time}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground italic">{booking.notes}</p>
                    )}
                    {booking.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleCancel(booking.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
