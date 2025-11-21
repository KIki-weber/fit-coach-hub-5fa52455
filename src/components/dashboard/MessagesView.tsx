import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

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
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

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

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Empty message",
        description: "Please write a message before sending.",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("messages").insert({
      user_id: session.user.id,
      sent_by: session.user.id,
      subject: "Re: Reply to Coach",
      content: replyContent,
      reply_to: messageId,
    });

    if (error) {
      toast({
        title: "Failed to send reply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reply Sent",
        description: "Your message has been sent to the coach.",
      });
      setReplyContent("");
      setReplyingTo(null);
    }
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
              <div key={message.id} className="space-y-3">
                <div
                  className={`p-4 rounded-lg border ${
                    message.read
                      ? "bg-secondary/20 border-border"
                      : "bg-primary/10 border-primary/30"
                  }`}
                  onClick={() => !message.read && markAsRead(message.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{message.subject}</h4>
                    {!message.read && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>

                {replyingTo === message.id && (
                  <div className="ml-6 p-3 bg-secondary/10 rounded-lg border border-border">
                    <Textarea
                      placeholder="Write your reply to the coach..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-primary"
                        onClick={() => handleReply(message.id)}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
