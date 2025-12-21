import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Camera, ChevronDown, ChevronUp, Filter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  height: number;
  height_unit: string;
  weight: number;
  weight_unit: string;
  exercise_plan: string;
  gender: string;
  photo_url: string;
  photo_description: string;
  photo_uploaded_at: string;
  created_at: string;
}

interface ProgressEntry {
  id: string;
  user_id: string;
  photo_url: string | null;
  height: number | null;
  height_unit: string;
  weight: number | null;
  weight_unit: string;
  notes: string | null;
  created_at: string;
}

const EXERCISE_PLAN_LABELS: Record<string, string> = {
  weight_loss: "Weight Loss",
  weight_gain: "Weight Gain",
  muscle_building: "Muscle Building",
  endurance: "Endurance Training",
  flexibility: "Flexibility & Mobility",
  general_fitness: "General Fitness",
  maintenance: "Maintenance",
};

export const AdminUserList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [progressData, setProgressData] = useState<Record<string, ProgressEntry[]>>({});
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [showCharts, setShowCharts] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [exercisePlanFilter, setExercisePlanFilter] = useState<string>("all");
  const [hasPhotosFilter, setHasPhotosFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, exercisePlanFilter, hasPhotosFilter, progressData]);

  const fetchUsers = async () => {
    const { data, count } = await supabase
      .from("profiles")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false });

    if (data) {
      setUsers(data);
      setTotalUsers(count || 0);
      
      // Fetch progress for all users
      const userIds = data.map(u => u.user_id);
      if (userIds.length > 0) {
        const { data: progress } = await supabase
          .from("progress_tracking")
          .select("*")
          .in("user_id", userIds)
          .order("created_at", { ascending: false });
        
        if (progress) {
          const grouped: Record<string, ProgressEntry[]> = {};
          progress.forEach((entry) => {
            if (!grouped[entry.user_id]) {
              grouped[entry.user_id] = [];
            }
            grouped[entry.user_id].push(entry);
          });
          setProgressData(grouped);
        }
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone_number?.includes(query)
      );
    }

    // Exercise plan filter
    if (exercisePlanFilter !== "all") {
      filtered = filtered.filter(user => user.exercise_plan === exercisePlanFilter);
    }

    // Has photos filter
    if (hasPhotosFilter === "with_photos") {
      filtered = filtered.filter(user => {
        const userProgress = progressData[user.user_id] || [];
        return userProgress.some(p => p.photo_url);
      });
    } else if (hasPhotosFilter === "without_photos") {
      filtered = filtered.filter(user => {
        const userProgress = progressData[user.user_id] || [];
        return !userProgress.some(p => p.photo_url);
      });
    }

    setFilteredUsers(filtered);
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return "N/A";
    const h = height / 100;
    const bmi = weight / (h * h);
    return Math.round(bmi * 10) / 10;
  };

  const toggleExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleChart = (userId: string) => {
    setShowCharts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const getChartData = (userId: string) => {
    const entries = progressData[userId] || [];
    return [...entries]
      .filter(e => e.weight)
      .reverse()
      .map(e => ({
        date: format(new Date(e.created_at), "MMM dd"),
        weight: e.weight_unit === "lb" ? Number((e.weight! * 0.453592).toFixed(1)) : e.weight,
        originalWeight: e.weight,
        unit: e.weight_unit
      }));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Registered Users
        </CardTitle>
        <CardDescription>
          Total users: {totalUsers} | Showing: {filteredUsers.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters Section */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={exercisePlanFilter} onValueChange={setExercisePlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {Object.entries(EXERCISE_PLAN_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={hasPhotosFilter} onValueChange={setHasPhotosFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by photos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="with_photos">With Progress Photos</SelectItem>
                <SelectItem value="without_photos">Without Progress Photos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No users match the current filters.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const userProgress = progressData[user.user_id] || [];
              const isExpanded = expandedUsers.has(user.user_id);
              const showChart = showCharts.has(user.user_id);
              const chartData = getChartData(user.user_id);
              
              return (
                <div
                  key={user.id}
                  className="p-4 bg-secondary/30 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user.photo_url} />
                      <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{user.full_name || "No name"}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.phone_number && (
                            <p className="text-sm text-muted-foreground">📱 {user.phone_number}</p>
                          )}
                        </div>
                        {user.exercise_plan && (
                          <Badge variant="secondary">
                            {EXERCISE_PLAN_LABELS[user.exercise_plan] || user.exercise_plan}
                          </Badge>
                        )}
                      </div>
                      
                      {user.photo_description && (
                        <p className="text-sm text-foreground/80 italic">
                          "{user.photo_description}"
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Gender: </span>
                          <span className="font-medium capitalize">
                            {user.gender || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Height: </span>
                          <span className="font-medium">
                            {user.height ? `${user.height}${user.height_unit || 'cm'}` : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight: </span>
                          <span className="font-medium">
                            {user.weight ? `${user.weight}${user.weight_unit || 'kg'}` : "N/A"}
                          </span>
                        </div>
                        {user.height && user.weight && (
                          <div>
                            <span className="text-muted-foreground">BMI: </span>
                            <span className="font-semibold text-primary">{calculateBMI(user.height, user.weight)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Joined: </span>
                          <span className="text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Progress Tracking Section */}
                      {userProgress.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(user.user_id)}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Camera className="w-4 h-4" />
                              Progress Photos ({userProgress.filter(p => p.photo_url).length})
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            
                            {chartData.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleChart(user.user_id)}
                                className="flex items-center gap-2 text-sm"
                              >
                                <TrendingUp className="w-4 h-4" />
                                Weight Chart
                                {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            )}
                          </div>

                          {/* Weight Chart */}
                          {showChart && chartData.length > 1 && (
                            <div className="mt-4 p-4 bg-background/50 rounded-lg">
                              <h5 className="text-sm font-medium mb-3">Weight Progress Over Time</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                  <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                          
                          {isExpanded && (
                            <div className="mt-3 grid gap-3">
                              {userProgress.map((entry) => (
                                <div key={entry.id} className="flex gap-3 p-3 bg-background/50 rounded-lg">
                                  {entry.photo_url && (
                                    <img
                                      src={entry.photo_url}
                                      alt="Progress"
                                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => window.open(entry.photo_url!, '_blank')}
                                    />
                                  )}
                                  <div className="flex-1 text-sm">
                                    <p className="text-muted-foreground">
                                      {format(new Date(entry.created_at), "PPP 'at' p")}
                                    </p>
                                    <div className="flex gap-4 mt-1">
                                      <span>
                                        <strong>Height:</strong> {entry.height || "N/A"} {entry.height_unit}
                                      </span>
                                      <span>
                                        <strong>Weight:</strong> {entry.weight || "N/A"} {entry.weight_unit}
                                      </span>
                                    </div>
                                    {entry.notes && (
                                      <p className="mt-1 text-muted-foreground italic">{entry.notes}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
