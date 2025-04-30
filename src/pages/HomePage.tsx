
import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { RoomCard } from "@/components/room/room-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CreateRoomDialog } from "@/components/room/create-room-dialog";
import { Room } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch rooms from database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        
        // Get all active rooms
        const { data: roomData, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Get all participants for each room
        const roomIds = roomData.map(room => room.id);
        
        if (roomIds.length === 0) {
          setRooms([]);
          return;
        }
        
        // Query room participants with profiles
        const { data: participantsData, error: participantsError } = await supabase
          .from('room_participants')
          .select(`
            *,
            profiles:user_id(id, username, avatar_url)
          `)
          .in('room_id', roomIds);
          
        if (participantsError) throw participantsError;
        
        // Format rooms with participants
        const formattedRooms = roomData.map(room => {
          const roomParticipants = participantsData?.filter(p => p.room_id === room.id) || [];
          
          const speakers = roomParticipants
            .filter(p => p.is_speaker)
            .map(p => {
              const profile = p.profiles || {};
              return {
                id: p.user_id,
                name: (profile as any).username || 'Anonymous',
                avatar: (profile as any).avatar_url || undefined,
                isModerator: p.is_moderator,
                isSpeaker: true,
                isMuted: p.is_muted,
                isHandRaised: p.is_hand_raised
              };
            });
          
          const participants = roomParticipants
            .filter(p => !p.is_speaker)
            .map(p => {
              const profile = p.profiles || {};
              return {
                id: p.user_id,
                name: (profile as any).username || 'Anonymous',
                avatar: (profile as any).avatar_url || undefined,
                isModerator: p.is_moderator,
                isSpeaker: false,
                isMuted: p.is_muted,
                isHandRaised: p.is_hand_raised
              };
            });
          
          // Find the host participant
          const hostParticipant = roomParticipants.find(p => p.user_id === room.host_id);
          const hostProfile = hostParticipant?.profiles || {};
          
          return {
            id: room.id,
            name: room.name,
            description: room.description,
            hostId: room.host_id,
            hostName: (hostProfile as any).username || 'Anonymous',
            hostAvatar: (hostProfile as any).avatar_url,
            speakers,
            participants,
            isLive: true,
            createdAt: room.created_at,
            topic: room.topic
          };
        });
        
        setRooms(formattedRooms);
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
  }, []);
  
  // Filter rooms by search term
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.name.toLowerCase().includes(searchLower) ||
      (room.description?.toLowerCase().includes(searchLower)) ||
      (room.topic?.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={!!user} userName={user?.user_metadata?.name || "User"} isModerator={user?.user_metadata?.isModerator} />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Explore Rooms</h1>
              <p className="text-muted-foreground">Join live conversations</p>
            </div>
            <CreateRoomDialog />
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rooms by name or topic..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-accent animate-pulse" />
              ))}
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-xl font-medium">No rooms found</h2>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search" : "Create a room to get started"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
