import { useEffect } from "react";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserProfileHeader } from "@/components/profile/user-profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useDetectionLogs } from "@/hooks/useDetectionLogs";
import { useDetectionInsights } from "@/hooks/useDetectionInsights";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { useUserStats } from "@/hooks/useUserStats";
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement";
import { useAuth } from "@/contexts/auth";

export default function ProfilePage() {
  const { checkSubscriptionStatus } = useAuth();
  const { logs, loading: logsLoading } = useDetectionLogs({}); // Fixed: Passing empty object as required
  const { insights, loading: insightsLoading } = useDetectionInsights({ logs, loading: logsLoading }); // Fixed: Passing required arguments
  const { stats: userStats, streak: userStreak } = useUserStats();
  
  // Fetch subscription status when the page loads
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  return (
    <ProtectedRoute>
      <ProfileProvider>
        <ProfileContent 
          userStats={userStats}
          userStreak={userStreak}
          logs={logs}
          insights={insights}
          logsLoading={logsLoading}
          insightsLoading={insightsLoading}
        />
      </ProfileProvider>
    </ProtectedRoute>
  );
}

// Separate component to use the ProfileContext properly
function ProfileContent({ 
  userStats, 
  userStreak, 
  logs, 
  insights,
  logsLoading,
  insightsLoading
}) {
  const { isEditProfileOpen, setIsEditProfileOpen } = useProfile();
  
  return (
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
  );
}
