import { AppHeader } from "@/components/layout/app-header";
import { UserProfileHeader } from "@/components/profile/user-profile-header";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Clip } from "@/types";
import { useDetectionLogs } from "@/hooks/useDetectionLogs";
import { useDetectionInsights } from "@/hooks/useDetectionInsights";
import { useUserStats } from "@/hooks/useUserStats";
import { Button } from "@/components/ui/button";

// Keep mock data for saves and clips since they're not part of this integration yet
const mockSaves: Save[] = [
  {
    id: "1",
    fromUserId: "2",
    fromUserName: "Taylor Swift",
    fromUserAvatar: "/placeholder.svg",
    toUserId: "1",
    message: "Helped me understand complex topics with patience",
    timestamp: "2023-04-15T15:30:00Z"
  },
  {
    id: "2",
    fromUserId: "3",
    fromUserName: "Sam Smith",
    fromUserAvatar: "/placeholder.svg",
    toUserId: "1",
    message: "Great advice on career development",
    timestamp: "2023-04-10T12:15:00Z"
  }
];

const mockClips: Clip[] = [
  {
    id: "1",
    userId: "1",
    roomId: "101",
    roomName: "Tech Talks: AI Revolution",
    title: "Insights on GPT-4 capabilities",
    description: "A fascinating discussion about the limits of AI language models",
    duration: 120, // in seconds
    timestamp: "2023-04-14T18:20:00Z"
  },
  {
    id: "2",
    userId: "1",
    roomId: "102",
    roomName: "Career Growth in Tech",
    title: "Navigating job interviews",
    description: "Tips for technical interviews in big tech companies",
    duration: 180, // in seconds
    timestamp: "2023-04-05T11:45:00Z"
  }
];

function ProfilePageContent() {
  const { user, isLoading: profileLoading, isEditProfileOpen, setIsEditProfileOpen } = useProfile();
  const { user: authUser } = useAuth();
  
  // Fetch real detection logs and insights
  const { logs, loading: logsLoading, error: logsError } = useDetectionLogs({
    userId: authUser?.id
  });
  
  const { insights, loading: insightsLoading } = useDetectionInsights({
    logs,
    loading: logsLoading
  });

  // Fetch user stats based on detection data
  const { stats, streak, loading: statsLoading, error: statsError } = useUserStats(authUser?.id);
  
  const isLoading = profileLoading || logsLoading || insightsLoading || statsLoading;
  const hasError = logsError || statsError;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground mb-6">
            {logsError || statsError || "An unknown error occurred"}
          </p>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Profile Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find your profile information. You may need to log in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={true} 
        userName={user.name} 
        userAvatar={user.avatar} 
        isModerator={user.isModerator} 
      />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <UserProfileHeader 
            user={user} 
            onEditProfile={() => setIsEditProfileOpen(true)} 
          />
          
          <ProfileTabs 
            stats={stats || { timeInRooms: 0, roomsJoined: 0, messagesPosted: 0, weeklyActivity: [], monthlyActivity: [] }}
            nsfwLogs={logs}
            nsfwInsights={insights}
            streak={streak || { current: 0, longest: 0, lastUpdated: new Date().toISOString() }}
            saves={mockSaves}
            clips={mockClips}
            logsLoading={logsLoading}
            insightsLoading={insightsLoading}
          />
        </div>
      </main>
      
      <EditProfileDialog 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProfileProvider>
      <ProfilePageContent />
    </ProfileProvider>
  );
}
