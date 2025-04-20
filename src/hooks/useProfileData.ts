
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Save, Clip, UserStats } from "@/types";

export function useProfileData(userId: string) {
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
      
      // Get user profiles for the from_user_ids
      const userIds = data.map(save => save.from_user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Map profiles to saves
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

  const { data: clips, isLoading: isClipsLoading } = useQuery({
    queryKey: ['clips', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_clips')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Map database fields to match Clip type
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

  const userStats: UserStats | undefined = profile ? {
    timeInRooms: profile.time_in_rooms || 0,
    roomsJoined: profile.rooms_joined || 0,
    messagesPosted: profile.messages_posted || 0,
    weeklyActivity: [], // This would need to be calculated from a separate table
    monthlyActivity: [] // This would need to be calculated from a separate table
  } : undefined;

  const userStreak = profile ? {
    current: profile.current_streak || 0,
    longest: profile.longest_streak || 0,
    lastUpdated: profile.last_activity || new Date().toISOString()
  } : undefined;

  return {
    profile,
    saves,
    clips,
    userStats,
    userStreak,
    isLoading: isProfileLoading || isSavesLoading || isClipsLoading
  };
}
