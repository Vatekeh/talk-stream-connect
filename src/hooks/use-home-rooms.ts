
import { useState, useEffect } from "react";
import { Room, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useHomeRooms(userId: string | undefined) {
  const [createdRooms, setCreatedRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch rooms from database
  useEffect(() => {
    const fetchRooms = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Get rooms created by the current user
        const { data: createdRoomsData, error: createdError } = await supabase
          .from('rooms')
          .select('*')
          .eq('creator_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (createdError) {
          console.error("Error fetching created rooms:", createdError);
          toast({
            title: "Error loading created rooms",
            description: "Could not fetch room data. Please try again later.",
            variant: "destructive",
          });
          throw createdError;
        }
        
        // Get rooms joined by the current user (excluding rooms where user is creator)
        const { data: joinedRoomsData, error: joinedError } = await supabase
          .from('room_participants')
          .select(`
            *,
            rooms:room_id(*)
          `)
          .eq('user_id', userId)
          .eq('is_creator', false)
          .eq('rooms.is_active', true);
          
        if (joinedError) {
          console.error("Error fetching joined rooms:", joinedError);
          toast({
            title: "Error loading joined rooms",
            description: "Could not fetch room data. Please try again later.",
            variant: "destructive",
          });
          throw joinedError;
        }
        
        // Get all participants for each room
        const allRoomIds = [...(createdRoomsData || []).map(room => room.id), 
                            ...(joinedRoomsData || []).filter(r => r.rooms).map(r => r.rooms.id)];
        
        if (allRoomIds.length === 0) {
          setCreatedRooms([]);
          setJoinedRooms([]);
          setIsLoading(false);
          return;
        }
        
        // Query room participants with profiles
        const { data: participantsData, error: participantsError } = await supabase
          .from('room_participants')
          .select(`
            *,
            profiles:user_id(id, username, avatar_url)
          `)
          .in('room_id', allRoomIds);
          
        if (participantsError) {
          console.error("Error fetching participants:", participantsError);
          toast({
            title: "Error loading participants",
            description: "Could not fetch participant data. Please try again later.",
            variant: "destructive",
          });
          throw participantsError;
        }
        
        // Format created rooms
        const formattedCreatedRooms = formatRooms(createdRoomsData || [], participantsData || []);
        
        // Format joined rooms
        const formattedJoinedRooms = formatJoinedRooms(joinedRoomsData || [], participantsData || []);
        
        setCreatedRooms(formattedCreatedRooms);
        setJoinedRooms(formattedJoinedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRooms();
    
    // Set up realtime subscription
    const roomsChannel = supabase
      .channel('rooms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants' }, () => {
        fetchRooms();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, [userId]);

  // Helper function to format rooms
  const formatRooms = (roomsData: any[], participantsData: any[]): Room[] => {
    return roomsData
      .map(room => {
        const roomParticipants = participantsData?.filter(p => p.room_id === room.id) || [];
        
        // Skip rooms with no participants
        if (roomParticipants.length === 0) {
          return null;
        }
        
        const speakers = formatParticipants(roomParticipants.filter(p => p.is_speaker));
        const participants = formatParticipants(roomParticipants.filter(p => !p.is_speaker));
        
        // Find the host participant
        const hostParticipant = roomParticipants.find(p => p.user_id === room.host_id);
        const hostProfile = hostParticipant?.profiles || {};
        
        return {
          id: room.id,
          name: room.name,
          description: room.description,
          hostId: room.host_id,
          creatorId: room.creator_id,
          hostName: (hostProfile as any).username || 'Anonymous',
          hostAvatar: (hostProfile as any).avatar_url,
          speakers,
          participants,
          isLive: true,
          createdAt: room.created_at,
          topic: room.topic
        };
      })
      .filter(Boolean) as Room[];
  };

  // Helper function to format joined rooms
  const formatJoinedRooms = (joinedRoomsData: any[], participantsData: any[]): Room[] => {
    return joinedRoomsData
      .filter(item => item.rooms) // Make sure room exists
      .map(item => {
        const room = item.rooms;
        const roomParticipants = participantsData?.filter(p => p.room_id === room.id) || [];
        
        // Skip rooms with no participants
        if (roomParticipants.length === 0) {
          return null;
        }
        
        const speakers = formatParticipants(roomParticipants.filter(p => p.is_speaker));
        const participants = formatParticipants(roomParticipants.filter(p => !p.is_speaker));
        
        // Find the host participant
        const hostParticipant = roomParticipants.find(p => p.user_id === room.host_id);
        const hostProfile = hostParticipant?.profiles || {};
        
        return {
          id: room.id,
          name: room.name,
          description: room.description,
          hostId: room.host_id,
          creatorId: room.creator_id,
          hostName: (hostProfile as any).username || 'Anonymous',
          hostAvatar: (hostProfile as any).avatar_url,
          speakers,
          participants,
          isLive: true,
          createdAt: room.created_at,
          topic: room.topic
        };
      })
      .filter(Boolean) as Room[];
  };

  // Helper function to format participants
  const formatParticipants = (participantsData: any[]): User[] => {
    return participantsData.map(p => {
      const profile = p.profiles || {};
      return {
        id: p.user_id,
        name: (profile as any).username || 'Anonymous',
        avatar: (profile as any).avatar_url || undefined,
        isModerator: p.is_moderator,
        isSpeaker: p.is_speaker,
        isMuted: p.is_muted,
        isHandRaised: p.is_hand_raised,
        isCreator: p.is_creator
      };
    });
  };

  // Filter rooms by search term
  const filterRooms = (rooms: Room[], searchTerm: string): Room[] => {
    if (!searchTerm) return rooms;
    
    const searchLower = searchTerm.toLowerCase();
    return rooms.filter(room => 
      room.name.toLowerCase().includes(searchLower) ||
      (room.description?.toLowerCase().includes(searchLower)) ||
      (room.topic?.toLowerCase().includes(searchLower))
    );
  };

  return {
    createdRooms,
    joinedRooms,
    isLoading,
    filterRooms
  };
}
