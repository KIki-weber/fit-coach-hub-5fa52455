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
  phone_number: string;
  height: number;
  weight: number;
  photo_url: string;
  photo_description: string;
  photo_uploaded_at: string;
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
                className="p-4 bg-secondary/30 rounded-lg border border-border"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.photo_url} />
                    <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-lg">{user.full_name || "No name"}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.phone_number && (
                        <p className="text-sm text-muted-foreground">📱 {user.phone_number}</p>
                      )}
                    </div>
                    
                    {user.photo_description && (
                      <p className="text-sm text-foreground/80 italic">
                        "{user.photo_description}"
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Height: </span>
                        <span className="font-medium">{user.height ? `${user.height}cm` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight: </span>
                        <span className="font-medium">{user.weight ? `${user.weight}kg` : "N/A"}</span>
                      </div>
                      {user.height && user.weight && (
                        <div>
                          <span className="text-muted-foreground">BMI: </span>
                          <span className="font-semibold text-primary">{calculateBMI(user.height, user.weight)}</span>
                        </div>
                      )}
                      {user.photo_uploaded_at && (
                        <div>
                          <span className="text-muted-foreground">Photo: </span>
                          <span className="text-xs">{new Date(user.photo_uploaded_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </div>
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
