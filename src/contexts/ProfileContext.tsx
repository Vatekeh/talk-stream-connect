
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface ProfileContextType {
  user: User | null;
  setUser: (user: User) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      fetchProfile(authUser.id);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [authUser]);

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Map Supabase profile data to our User type
      const userProfile: User = {
        id: data.id,
        name: data.username || 'Anonymous',
        avatar: data.avatar_url || '/placeholder.svg',
        pronouns: data.pronouns || '',
        bio: data.bio || '',
        createdAt: data.created_at,
        lastActive: data.last_activity,
        isModerator: data.is_moderator || false
      };

      setUser(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: Partial<User>) => {
    if (!user || !authUser) return;

    try {
      // Map our User type to Supabase profile structure
      const updates = {
        username: profile.name,
        pronouns: profile.pronouns,
        bio: profile.bio,
        avatar_url: profile.avatar,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state with new data
      setUser({
        ...user,
        ...profile
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user || !authUser) return null;

    try {
      // Create a unique file path for the avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      return null;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isLoading,
        updateProfile,
        uploadAvatar
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
