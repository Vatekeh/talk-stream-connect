
import { useEffect, useState } from "react";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserProfileHeader } from "@/components/profile/user-profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useDetectionLogs } from "@/hooks/useDetectionLogs";
import { useDetectionInsights } from "@/hooks/useDetectionInsights";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { useUserStats } from "@/hooks/useUserStats";
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";

export default function ProfilePage() {
  const { checkSubscriptionStatus } = useAuth();
  const { logs, loading: logsLoading } = useDetectionLogs();
  const { insights, loading: insightsLoading } = useDetectionInsights();
  const { stats: userStats, streak: userStreak } = useUserStats();
  const { isEditProfileOpen, setIsEditProfileOpen } = useProfile();
  
  // Fetch subscription status when the page loads
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  return (
    <ProtectedRoute>
      <ProfileProvider>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column with user profile info */}
            <div className="space-y-6">
              <UserProfileHeader />
              <SubscriptionManagement />
            </div>
            
            {/* Right column with tabs and content */}
            <div className="md:col-span-2">
              <ProfileTabs
                stats={userStats}
                streak={userStreak}
                nsfwLogs={logs || []}
                nsfwInsights={insights}
                saves={[]}
                clips={[]}
                logsLoading={logsLoading}
                insightsLoading={insightsLoading}
              />
            </div>
          </div>
          <EditProfileDialog 
            isOpen={isEditProfileOpen} 
            onClose={() => setIsEditProfileOpen(false)} 
          />
        </div>
      </ProfileProvider>
    </ProtectedRoute>
  );
}
