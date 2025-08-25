
import { useState } from "react";
import { Link } from "react-router-dom";
import { NavigationLinks } from "./navigation-links";
import { MobileNavigation } from "./mobile-navigation";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth";
import { UserDropdown } from "./user-dropdown";

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-clutsh-midnight sticky top-0 z-10 border-b border-clutsh-slate">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-clutsh-light flex items-center hover:opacity-80 transition-opacity">
          <img 
            src="/lovable-uploads/f6617d82-9257-4618-bd1e-c81e35bc55fa.png" 
            alt="Clutsh Logo" 
            className="h-8 w-8 mr-3 rounded"
          />
          Clutsh
        </Link>

        {/* Navigation Links - Hidden on Mobile */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationLinks />
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <UserDropdown />
          ) : (
            <Link to="/login">
              <Button 
                variant="outline" 
                className="bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel border-clutsh-slate"
              >
                Sign In
              </Button>
            </Link>
          )}
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}
