
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
          message,
          created_at,
          profiles!user_saves_from_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('to_user_id', userId);
      
      if (error) throw error;
      
      return data.map((save) => ({
        id: save.id,
        fromUserId: save.from_user_id,
        fromUserName: save.profiles.username,
        fromUserAvatar: save.profiles.avatar_url,
        message: save.message,
        timestamp: save.created_at
      }));
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
      return data;
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
