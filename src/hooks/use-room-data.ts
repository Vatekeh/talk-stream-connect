
import { useState, useEffect, useRef, useMemo } from "react";
import { Room, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useRoomData(roomId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentUserParticipant, setCurrentUserParticipant] = useState<User | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Add a debounce timer ref to limit update frequency
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        setError(new Error(roomError.message));
        toast.error("Could not load room data. The room may no longer exist.");
        navigate('/');
        return;
      }
      
      // Get room participants with profiles
      const { data: participantsData, error: participantsError } = await supabase
        .from('room_participants')
        .select(`
          *,
          profiles:user_id(id, username, avatar_url, bio)
        `)
        .eq('room_id', roomId);
        
      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        setError(new Error(participantsError.message));
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
      setError(null);
      
      // Check if current user is in the room
      if (user) {
        const userParticipant = [...speakers, ...participants].find(p => p.id === user.id) || null;
        setCurrentUserParticipant(userParticipant);
      }
    } catch (err) {
      console.error("Error fetching room data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      toast.error("Could not load room data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRoomData();
  }, [roomId, user]);
  
  // Set up debounced realtime subscription to room changes
  useEffect(() => {
    if (!roomId) return;
    
    // Function to handle database changes with debouncing
    const debouncedFetchRoomData = () => {
      // Clear any pending timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set a new timer
      debounceTimerRef.current = setTimeout(() => {
        console.log("[RoomData] Debounced data refresh triggered");
        fetchRoomData();
        debounceTimerRef.current = null;
      }, 250); // 250ms debounce time
    };
    
    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, 
        () => {
          debouncedFetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, 
        () => {
          debouncedFetchRoomData();
        }
      )
      .subscribe();
      
    return () => {
      // Clean up timer and channel on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      supabase.removeChannel(roomChannel);
    };
  }, [roomId]);

  // No changes needed to the return statement
  return {
    room,
    isLoading,
    error,
    currentUserParticipant,
    setCurrentUserParticipant
  };
}
