import {
  Users,
  Calendar,
  Mail,
  Utensils,
  CalendarDays,
  BarChart3,
  LogOut,
  KeyRound,
  ClipboardList,
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
  useSidebar,
} from "@/components/ui/sidebar";
import logoRunner from "@/assets/logo-runner.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  newUserCount: number;
}

export function AdminSidebar({ activeSection, onSectionChange, onLogout, newUserCount }: AdminSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { t } = useI18n();

  const menuItems = [
    { id: "overview", title: t("overview"), icon: BarChart3 },
    { id: "users", title: t("registeredUsers"), icon: Users, showBadge: true },
    { id: "bookings", title: t("bookingRequests"), icon: ClipboardList },
    { id: "events", title: t("events"), icon: CalendarDays },
    { id: "schedules", title: t("schedules"), icon: Calendar },
    { id: "nutrition", title: t("nutritionPlans"), icon: Utensils },
    { id: "messages", title: t("messages"), icon: Mail },
    { id: "passwords", title: t("passwords"), icon: KeyRound },
  ];

  const handleClick = (id: string) => {
    onSectionChange(id);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <img src={logoRunner} alt="OneLove Fitness" className="w-8 h-8" />
          <div>
            <h2 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">OneLove Fitness</h2>
            <p className="text-xs text-muted-foreground">{t("adminPanel")}</p>
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
                    onClick={() => handleClick(item.id)}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.showBadge && newUserCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">
                        {newUserCount}
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
          {t("logout")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
