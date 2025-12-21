import { 
  Users, 
  Calendar, 
  Mail, 
  Utensils, 
  CalendarDays,
  BarChart3,
  LogOut,
  ClipboardList
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import logoRunner from "@/assets/logo-runner.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  newUserCount: number;
}

const menuItems = [
  { id: "overview", title: "Overview", icon: BarChart3 },
  { id: "users", title: "Registered Users", icon: Users, showBadge: true },
  { id: "bookings", title: "Booking Requests", icon: ClipboardList },
  { id: "events", title: "Events", icon: CalendarDays },
  { id: "schedules", title: "Schedules", icon: Calendar },
  { id: "nutrition", title: "Nutrition Plans", icon: Utensils },
  { id: "messages", title: "Messages", icon: Mail },
];

export function AdminSidebar({ activeSection, onSectionChange, onLogout, newUserCount }: AdminSidebarProps) {
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <img src={logoRunner} alt="VitalityHub" className="w-8 h-8" />
          <div>
            <h2 className="font-bold text-lg">VitalityHub</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.showBadge && newUserCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">
                        {newUserCount} new
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <Button variant="ghost" onClick={onLogout} className="w-full justify-start">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
