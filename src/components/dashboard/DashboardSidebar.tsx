import {
  User,
  Camera,
  Calendar,
  Calculator,
  Utensils,
  Mail,
  CalendarDays,
  Activity,
  Heart,
  KeyRound,
  LogOut,
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
import { useI18n } from "@/lib/i18n";

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export function DashboardSidebar({ activeSection, onSectionChange, onLogout }: DashboardSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { t } = useI18n();

  const menuItems = [
    { id: "profile", title: t("myProfile"), icon: User },
    { id: "progress", title: t("progressTracking"), icon: Camera },
    { id: "booking", title: t("bookCoach"), icon: Activity },
    { id: "events", title: t("events"), icon: CalendarDays },
    { id: "calculators", title: t("bmiBmr"), icon: Calculator },
    { id: "heartrate", title: t("heartRate"), icon: Heart },
    { id: "nutrition", title: t("aiNutrition"), icon: Utensils },
    { id: "schedule", title: t("mySchedule"), icon: Calendar },
    { id: "messages", title: t("messages"), icon: Mail },
    { id: "password", title: t("changePassword"), icon: KeyRound },
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
            <p className="text-xs text-muted-foreground">{t("dashboard")}</p>
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
                    onClick={() => handleClick(item.id)}
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
          {t("logout")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
