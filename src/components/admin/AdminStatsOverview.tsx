import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Calendar, Apple, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalMessages: number;
  totalSchedules: number;
  totalNutrition: number;
  totalEvents: number;
}

export const AdminStatsOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalMessages: 0,
    totalSchedules: 0,
    totalNutrition: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [usersResult, messagesResult, schedulesResult, nutritionResult, eventsResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("schedules").select("*", { count: "exact", head: true }),
      supabase.from("nutrition").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      totalUsers: usersResult.count || 0,
      totalMessages: messagesResult.count || 0,
      totalSchedules: schedulesResult.count || 0,
      totalNutrition: nutritionResult.count || 0,
      totalEvents: eventsResult.count || 0,
    });
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Messages", value: stats.totalMessages, icon: MessageSquare, color: "text-green-500" },
    { title: "Schedules", value: stats.totalSchedules, icon: Calendar, color: "text-purple-500" },
    { title: "Nutrition Plans", value: stats.totalNutrition, icon: Apple, color: "text-orange-500" },
    { title: "Events Posted", value: stats.totalEvents, icon: Activity, color: "text-pink-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
