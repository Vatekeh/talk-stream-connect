
import { Link } from "react-router-dom";
import { NavigationLinks } from "./navigation-links";
import { Button } from "../ui/button";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TrialCountdown } from "@/components/subscription/TrialCountdown";

export function AppHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-clutsh-midnight sticky top-0 z-10 border-b border-clutsh-slate">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-clutsh-light flex items-center">
          <img 
            src="/lovable-uploads/f6617d82-9257-4618-bd1e-c81e35bc55fa.png" 
            alt="Clutsh Logo" 
            className="h-8 w-8 mr-2 rounded"
          />
          Clutsh
        </Link>

        {/* Navigation Links - Hidden on Mobile */}
        <div className="hidden md:block">
          <NavigationLinks />
        </div>

        {/* Trial badge */}
        <div className="hidden md:block">
          <TrialCountdown />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" className="text-clutsh-light hover:bg-clutsh-steel">
                  <User className="h-5 w-5" />
                  <span className="ml-2 hidden md:inline">Profile</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button 
                variant="outline" 
                className="bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel"
              >
                Sign In
              </Button>
            </Link>
          )}
          
          {/* Mobile menu button - just for visuals, not functional in this example */}
          <Button variant="ghost" className="text-clutsh-light hover:bg-clutsh-steel md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
