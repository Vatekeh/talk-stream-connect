
import { useState, useEffect } from "react";
import { Room, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useRoomData(roomId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserParticipant, setCurrentUserParticipant] = useState<User | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Function to fetch room data
  const fetchRoomData = async () => {
    if (!roomId) return;
    
    try {
      // Get room data
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
        
      if (roomError) {
        console.error("Error fetching room:", roomError);
        toast.error("Could not load room data. The room may no longer exist.");
        navigate('/');
        return;
      }
      
      // Get room participants with profiles
      const { data: participantsData, error: participantsError } = await supabase
        .from('room_participants')
        .select(`
          *,
          profiles:user_id(id, username, avatar_url, bio, pronouns)
        `)
        .eq('room_id', roomId);
        
      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        toast.error("Could not fetch participant data. Please try again later.");
        throw participantsError;
      }
      
      // Format participants
      const speakers = participantsData
        .filter(p => p.is_speaker)
        .map(p => {
          const profile = p.profiles || {};
          return {
            id: p.user_id,
            name: (profile as any).username || 'Anonymous',
            avatar: (profile as any).avatar_url,
            isModerator: p.is_moderator,
            isSpeaker: true,
            isMuted: p.is_muted,
            isHandRaised: p.is_hand_raised,
            pronouns: (profile as any).pronouns,
            bio: (profile as any).bio
          };
        });
        
      const participants = participantsData
        .filter(p => !p.is_speaker)
        .map(p => {
          const profile = p.profiles || {};
          return {
            id: p.user_id,
            name: (profile as any).username || 'Anonymous',
            avatar: (profile as any).avatar_url,
            isModerator: p.is_moderator,
            isSpeaker: false,
            isMuted: p.is_muted,
            isHandRaised: p.is_hand_raised,
            pronouns: (profile as any).pronouns,
            bio: (profile as any).bio
          };
        });
      
      // Find the host participant
      const hostParticipant = participantsData.find(p => p.user_id === roomData.host_id);
      const hostProfile = hostParticipant?.profiles || {};
      
      // Format room object
      const formattedRoom = {
        id: roomData.id,
        name: roomData.name,
        description: roomData.description,
        hostId: roomData.host_id,
        hostName: (hostProfile as any).username || 'Anonymous',
        hostAvatar: (hostProfile as any).avatar_url,
        speakers,
        participants,
        isLive: roomData.is_active,
        createdAt: roomData.created_at,
        topic: roomData.topic
      };
      
      setRoom(formattedRoom);
      
      // Check if current user is in the room
      if (user) {
        const userParticipant = [...speakers, ...participants].find(p => p.id === user.id) || null;
        setCurrentUserParticipant(userParticipant);
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      toast.error("Could not load room data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRoomData();
  }, [roomId, user]);
  
  // Set up realtime subscription to room changes
  useEffect(() => {
    if (!roomId) return;
    
    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, 
        () => {
          fetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, 
        () => {
          fetchRoomData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId]);

  return {
    room,
    isLoading,
    currentUserParticipant,
    setCurrentUserParticipant
  };
}
