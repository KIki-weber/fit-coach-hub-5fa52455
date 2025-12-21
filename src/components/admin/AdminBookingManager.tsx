import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  notes: string | null;
  status: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
}

const SERVICE_LABELS: Record<string, string> = {
  personal_training: "Personal Training Session",
  group_training: "Group Training Session",
  nutrition_consult: "Nutrition Consultation",
  fitness_assessment: "Fitness Assessment",
  strength_coaching: "Strength & Conditioning",
};

export const AdminBookingManager = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: bookingsData, error } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
      return;
    }

    setBookings(bookingsData || []);

    // Fetch user profiles for all bookings
    const userIds = [...new Set(bookingsData?.map(b => b.user_id) || [])];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, phone_number")
        .in("user_id", userIds);

      if (profilesData) {
        const usersMap: Record<string, UserProfile> = {};
        profilesData.forEach(p => {
          usersMap[p.user_id] = p;
        });
        setUsers(usersMap);
      }
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setActionLoading(bookingId);

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Booking ${newStatus === "accepted" ? "Accepted" : "Rejected"}`,
        description: `The booking has been ${newStatus}.`,
      });
      fetchBookings();
    }
    setActionLoading(null);
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

  const filteredBookings = bookings.filter(b => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Booking Requests
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500 text-white ml-2">{pendingCount} pending</Badge>
          )}
        </CardTitle>
        <CardDescription>Manage coaching session requests from users</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {["all", "pending", "accepted", "rejected"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No {filter !== "all" ? filter : ""} bookings found.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const userProfile = users[booking.user_id];
              const isActionLoading = actionLoading === booking.id;

              return (
                <div
                  key={booking.id}
                  className="p-4 border rounded-lg bg-secondary/30 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">
                        {SERVICE_LABELS[booking.service_type] || booking.service_type}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(booking.booking_date), "EEEE, MMMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.booking_time}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* User Info */}
                  {userProfile && (
                    <div className="flex items-center gap-2 text-sm bg-background/50 p-2 rounded">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{userProfile.full_name}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground">{userProfile.email}</span>
                      {userProfile.phone_number && (
                        <>
                          <span className="text-muted-foreground">|</span>
                          <span className="text-muted-foreground">{userProfile.phone_number}</span>
                        </>
                      )}
                    </div>
                  )}

                  {booking.notes && (
                    <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                      "{booking.notes}"
                    </p>
                  )}

                  {/* Action Buttons */}
                  {booking.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(booking.id, "accepted")}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleStatusUpdate(booking.id, "rejected")}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
