import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  created_at: string;
  sent_by: string;
  user_id: string;
  read: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const AdminMessageSender = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [messageData, setMessageData] = useState({
    subject: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchReceivedMessages();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .order("full_name");

    if (data) {
      setUsers(data);
    }
  };

  const fetchReceivedMessages = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .eq("sent_by", session.user.id)
      .neq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setReceivedMessages(data as unknown as Message[]);
    }

    // Also fetch messages sent TO admin (replies from users)
    const { data: replies } = await supabase
      .from("messages")
      .select(`
        *,
        profiles:sent_by (full_name, email)
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (replies) {
      setReceivedMessages(prev => [...prev, ...(replies as unknown as Message[])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast({
        title: "Select a user",
        description: "Please select a user to send this message to.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("messages").insert({
      user_id: selectedUser,
      subject: messageData.subject,
      content: messageData.content,
      sent_by: session?.user.id,
      reply_to: replyTo,
    });

    if (error) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Message Sent",
        description: "Your message has been delivered to the user.",
      });
      setMessageData({ subject: "", content: "" });
      setSelectedUser("");
      setReplyTo(null);
      fetchReceivedMessages();
    }
    setLoading(false);
  };

  const handleReply = (message: Message) => {
    setSelectedUser(message.sent_by === message.user_id ? message.sent_by : message.user_id);
    setMessageData({
      subject: `Re: ${message.subject}`,
      content: "",
    });
    setReplyTo(message.id);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Messages & Communication
        </CardTitle>
        <CardDescription>Send messages and view replies from users</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send Message</TabsTrigger>
            <TabsTrigger value="inbox">
              <Inbox className="w-4 h-4 mr-2" />
              Inbox ({receivedMessages.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="send">
            <form onSubmit={handleSendMessage} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="message-user-select">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="message-user-select">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-subject">Subject</Label>
            <Input
              id="message-subject"
              value={messageData.subject}
              onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
              placeholder="Training Update"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-content">Message</Label>
            <Textarea
              id="message-content"
              value={messageData.content}
              onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
              placeholder="Write your message here..."
              rows={5}
              required
            />
          </div>

              {replyTo && (
                <div className="text-sm text-muted-foreground">
                  Replying to message...
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="inbox">
            <ScrollArea className="h-[500px] mt-4">
              {receivedMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedMessages.map((message) => (
                    <Card key={message.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{message.subject}</CardTitle>
                            <CardDescription>
                              From: {message.profiles?.full_name || message.profiles?.email || "User"}
                              <br />
                              {new Date(message.created_at).toLocaleDateString()} at{" "}
                              {new Date(message.created_at).toLocaleTimeString()}
                            </CardDescription>
                          </div>
                          {!message.read && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap mb-3">{message.content}</p>
                        <Button 
                          onClick={() => handleReply(message)} 
                          variant="outline" 
                          size="sm"
                        >
                          <Send className="w-3 h-3 mr-2" />
                          Reply
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
