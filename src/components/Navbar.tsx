import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logoRunner from "@/assets/logo-runner.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/training", label: "Training" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-foreground">
          <img src={logoRunner} alt="VitalityHub" className="w-7 h-7 md:w-8 md:h-8" />
          <span className="hidden xs:inline">VitalityHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="text-foreground hover:text-primary transition-colors text-sm xl:text-base"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                Login
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm" className="bg-gradient-primary text-xs md:text-sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.to} 
                      to={link.to} 
                      onClick={() => setIsOpen(false)}
                      className="text-foreground hover:text-primary transition-colors text-lg font-medium py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-primary">
                      Get Started
                    </Button>
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
