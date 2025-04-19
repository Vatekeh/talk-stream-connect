
import { AppHeader } from "@/components/layout/app-header";
import { UserProfileHeader } from "@/components/profile/user-profile-header";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function ProfilePageContent() {
  const { user, setUser, isEditProfileOpen, setIsEditProfileOpen } = useProfile();
  const { user: authUser } = useAuth();
  const { profile, saves, clips, userStats, userStreak, isLoading } = useProfileData(authUser?.id || '');

  const handleUpdateProfile = async (updatedUser: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: updatedUser.name,
        avatar_url: updatedUser.avatar,
        bio: updatedUser.bio
      })
      .eq('id', authUser?.id);

    if (!error) {
      setUser({ ...user, ...updatedUser });
      setIsEditProfileOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={true} 
        userName={profile?.username || ''} 
        userAvatar={profile?.avatar_url} 
        isModerator={profile?.is_moderator} 
      />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <UserProfileHeader 
            user={{
              id: authUser?.id || '',
              name: profile?.username || '',
              avatar: profile?.avatar_url,
              bio: profile?.bio,
              pronouns: profile?.pronouns,
              createdAt: profile?.created_at,
              isModerator: profile?.is_moderator
            }}
            onEditProfile={() => setIsEditProfileOpen(true)} 
          />
          
          <ProfileTabs 
            stats={userStats}
            saves={saves || []}
            clips={clips || []}
            streak={userStreak}
          />
        </div>
      </main>
      
      <EditProfileDialog 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)}
        user={{
          id: authUser?.id || '',
          name: profile?.username || '',
          avatar: profile?.avatar_url,
          bio: profile?.bio,
          pronouns: profile?.pronouns,
          createdAt: profile?.created_at,
          isModerator: profile?.is_moderator
        }}
        onSave={handleUpdateProfile}
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
