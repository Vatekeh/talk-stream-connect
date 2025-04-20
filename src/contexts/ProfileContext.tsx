
/**
 * ProfileContext provides local user profile data (from Supabase).
 * Includes details like avatar, pronouns, activity, and moderator status.
 * Uses React Query to fetch and cache profile data for the logged in user.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProfileContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (isOpen: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

/**
 * ProfileProvider component: fetches and exposes user profile details to children.
 * - Relies on Supabase "profiles" table and uses React Query for caching.
 * - Allows profile editing dialog state for UI.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Fetch profile data for logged-in user with React Query.
  const { data: profile } = useQuery({
    queryKey: ['profile', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return {
        id: data.id,
        name: data.username || 'Anonymous',
        avatar: data.avatar_url,
        pronouns: '',  // Add this field to profiles table if needed
        bio: data.bio || '',
        createdAt: data.created_at,
        lastActive: data.last_activity,
        isModerator: data.is_moderator || false
      };
    },
    enabled: !!authUser?.id,
  });

  // Update local user state when new profile data fetched
  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile]);

  // Provide state and update functions to children components
  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
        isEditProfileOpen,
        setIsEditProfileOpen,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * useProfile() consumes ProfileContext.
 * Throws if used outside <ProfileProvider>.
 */
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
