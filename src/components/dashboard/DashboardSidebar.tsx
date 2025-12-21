import { 
  User, 
  Camera, 
  Calendar, 
  Calculator, 
  Utensils, 
  Mail, 
  CalendarDays,
  Activity,
  LogOut
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

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "profile", title: "My Profile", icon: User },
  { id: "progress", title: "Progress Tracking", icon: Camera },
  { id: "booking", title: "Book with Coach Dave", icon: Activity },
  { id: "events", title: "Events", icon: CalendarDays },
  { id: "calculators", title: "BMI & BMR Calculator", icon: Calculator },
  { id: "nutrition", title: "AI Nutrition", icon: Utensils },
  { id: "schedule", title: "My Schedule", icon: Calendar },
  { id: "messages", title: "Messages", icon: Mail },
];

export function DashboardSidebar({ activeSection, onSectionChange, onLogout }: DashboardSidebarProps) {
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <img src={logoRunner} alt="VitalityHub" className="w-8 h-8" />
          <div>
            <h2 className="font-bold text-lg">VitalityHub</h2>
            <p className="text-xs text-muted-foreground">User Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
                    <span>{item.title}</span>
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
