import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
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

  useEffect(() => {
    fetchUsers();
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
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Send Message
        </CardTitle>
        <CardDescription>Send updates and messages to users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendMessage} className="space-y-4">
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

          <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
