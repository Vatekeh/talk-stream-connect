
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/layout/app-header";
import { ChangelogHeader } from "@/components/changelog/ChangelogHeader";
import { ChangelogContent } from "@/components/changelog/ChangelogContent";

export default function ChangelogPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={!!user} 
        userName={user?.user_metadata?.name || user?.email?.split('@')[0] || "Guest User"} 
        userAvatar={user?.user_metadata?.avatar_url}
        isModerator={user?.user_metadata?.is_moderator}
      />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <ChangelogHeader />
          
          <div className="prose prose-slate max-w-none">
            <div className="border-b border-border pb-4 mb-8">
              <p className="text-lg">
                This page documents comprehensive updates, features, improvements, and bug fixes across Clutsh's development lifecycle.
              </p>
            </div>
            
            <ChangelogContent />
          </div>
        </div>
      </div>
      
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Clutsh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
