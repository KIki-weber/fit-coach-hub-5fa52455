import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  height: number;
  weight: number;
  photo_url: string;
  created_at: string;
}

export const AdminUserList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, count } = await supabase
      .from("profiles")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false });

    if (data) {
      setUsers(data);
      setTotalUsers(count || 0);
    }
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return "N/A";
    const h = height / 100;
    const bmi = weight / (h * h);
    return Math.round(bmi * 10) / 10;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Registered Users
        </CardTitle>
        <CardDescription>
          Total users: {totalUsers}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No users registered yet.
          </p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-secondary/30 rounded-lg border border-border flex items-center gap-4"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.photo_url} />
                  <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{user.full_name || "No name"}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {user.height && user.weight && (
                      <>
                        <span className="text-muted-foreground">BMI: </span>
                        <span className="font-semibold">{calculateBMI(user.height, user.weight)}</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.height ? `${user.height}cm` : "N/A"} / {user.weight ? `${user.weight}kg` : "N/A"}
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
