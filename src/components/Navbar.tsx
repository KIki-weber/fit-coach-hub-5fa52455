import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logoImage from "@/assets/a.png";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { id: "home", label: t("home") },
    { id: "about", label: t("about") },
    { id: "services", label: "Services" },
    { id: "nutrition", label: t("nutrition") },
    { id: "training", label: t("training") },
    { id: "trainers", label: "Our Trainers" },
    { id: "contact", label: t("contact") },
  ];

  const scrollTo = (id: string) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4 flex items-center justify-between gap-2">
        <button onClick={() => scrollTo("home")} className="flex items-center text-base sm:text-lg md:text-xl text-foreground shrink-0 w-full max-w-[160px]">
          <img src={logoImage} alt="Logo" className="block w-full h-full max-h-55 rounded-none object-cover" />
        </button>

        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-foreground hover:text-primary transition-colors text-sm xl:text-base font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <div className="hidden md:block">
            <LanguageSelector compact />
          </div>
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                {t("login")}
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm" className="bg-gradient-primary text-xs md:text-sm">
                {t("getStarted")}
              </Button>
            </Link>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollTo(link.id)}
                      className="text-left text-foreground hover:text-primary transition-colors text-lg font-medium py-2"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <LanguageSelector />
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-primary">{t("getStarted")}</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
