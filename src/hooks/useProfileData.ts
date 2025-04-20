
/**
 * useProfileData - Custom hook to fetch user profile data, saves, and clips from Supabase.
 * Uses React Query for data fetching and caching.
 * Returns profile data, saves written to this user, video clips, stats, and activity streak.
 * 
 * @param userId - The Supabase user id to fetch profile data for
 * 
 * @returns {
 *   profile,
 *   saves,
 *   clips,
 *   userStats,
 *   userStreak,
 *   isLoading,
 * }
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Save, Clip, UserStats } from "@/types";

export function useProfileData(userId: string) {
  // Fetches profile for given userId from Supabase "profiles"
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetches all saves given to this user, and maps save creators to their profiles
  const { data: saves, isLoading: isSavesLoading } = useQuery({
    queryKey: ['saves', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_saves')
        .select(`
          id,
          from_user_id,
          message,
          created_at
        `)
        .eq('to_user_id', userId);
      
      if (error) throw error;
      
      // Attach creator profile to each save
      const userIds = data.map(save => save.from_user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Combine save and creator info for UI
      const savesWithProfiles = data.map(save => {
        const fromUser = profiles.find(profile => profile.id === save.from_user_id);
        return {
          id: save.id,
          fromUserId: save.from_user_id,
          toUserId: userId,
          fromUserName: fromUser?.username || 'Unknown User',
          fromUserAvatar: fromUser?.avatar_url,
          message: save.message,
          timestamp: save.created_at
        };
      });
      
      return savesWithProfiles;
    }
  });

  // Fetches clips posted by this user from Supabase "user_clips"
  const { data: clips, isLoading: isClipsLoading } = useQuery({
    queryKey: ['clips', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_clips')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Format results to conform to Clip type/interface
      return data.map(clip => ({
        id: clip.id,
        userId: clip.user_id,
        roomId: clip.room_id,
        roomName: clip.room_name,
        title: clip.title,
        description: clip.description,
        duration: clip.duration,
        timestamp: clip.created_at,
        thumbnailUrl: undefined // Add default value for optional field
      }));
    }
  });

  /**
   * Stats for user activity and engagement (derived from profile)
   *   - timeInRooms: Minutes/hours spent in rooms
   *   - roomsJoined: Number of rooms user joined
   *   - messagesPosted: Message count
   *   - weeklyActivity/monthlyActivity: Placeholder, needs separate table
   */
  const userStats: UserStats | undefined = profile ? {
    timeInRooms: profile.time_in_rooms || 0,
    roomsJoined: profile.rooms_joined || 0,
    messagesPosted: profile.messages_posted || 0,
    weeklyActivity: [], // Placeholder
    monthlyActivity: [] // Placeholder
  } : undefined;

  /**
   * Current and longest streak calculated from profile columns.
   * lastUpdated is datetime of last activity.
   */
  const userStreak = profile ? {
    current: profile.current_streak || 0,
    longest: profile.longest_streak || 0,
    lastUpdated: profile.last_activity || new Date().toISOString()
  } : undefined;

  // Shared output for UI (typings in /types can be extended)
  return {
    profile,
    saves,
    clips,
    userStats,
    userStreak,
    isLoading: isProfileLoading || isSavesLoading || isClipsLoading
  };
}
