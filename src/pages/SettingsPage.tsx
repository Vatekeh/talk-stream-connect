
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { UserProfileSection } from "@/components/settings/UserProfileSection";
import { NotificationSection } from "@/components/settings/NotificationSection";
import { HouseManagementSection } from "@/components/settings/HouseManagementSection";
import { PreferencesSection } from "@/components/settings/PreferencesSection";
import { AboutLegalSection } from "@/components/settings/AboutLegalSection";
import { LogoutSection } from "@/components/settings/LogoutSection";
import { useAuth } from "@/contexts/auth";

export default function SettingsPage() {
  const { checkSubscriptionStatus } = useAuth();
  const isMobile = useIsMobile();
  
  // Fetch subscription status when the page loads
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  return (
    <div className="flex flex-col min-h-screen bg-clutsh-midnight">
      {/* Header */}
      <AppHeader />
      
      {/* Settings Content */}
      <div className="flex-1 container max-w-md mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link to="/" className="mr-3">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-clutsh-light">Settings</h1>
        </div>
        
        {/* Settings Sections */}
        <div className="space-y-6 pb-24">
          <UserProfileSection />
          <NotificationSection />
          <HouseManagementSection />
          <PreferencesSection />
          <AboutLegalSection />
        </div>
        
        {/* Sticky Logout Section */}
        <LogoutSection />
      </div>
    </div>
  );
}
