import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

interface Message {
  id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface MessagesViewProps {
  userId: string;
}

export const MessagesView = ({ userId }: MessagesViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to message changes
    const subscription = supabase
      .channel('messages_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `user_id=eq.${userId}` },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setMessages(data);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId);
    
    fetchMessages();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Messages from Coach
        </CardTitle>
        <CardDescription>Updates and messages from your training coach</CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No messages yet. Your coach will send updates soon.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="p-4 bg-secondary/30 rounded-lg border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => !message.read && markAsRead(message.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{message.subject}</h4>
                  {!message.read && <Badge variant="default">New</Badge>}
                </div>
                <p className="text-muted-foreground">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
