
import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { RoomCard } from "@/components/room/room-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CreateRoomDialog } from "@/components/room/create-room-dialog";
import { Room } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [createdRooms, setCreatedRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch rooms from database
  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get rooms created by the current user
        const { data: createdRoomsData, error: createdError } = await supabase
          .from('rooms')
          .select('*')
          .eq('creator_id', user.id)
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
          .eq('user_id', user.id)
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
        const formattedCreatedRooms = (createdRoomsData || [])
          .map(room => {
            const roomParticipants = participantsData?.filter(p => p.room_id === room.id) || [];
            
            // Skip rooms with no participants
            if (roomParticipants.length === 0) {
              return null;
            }
            
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
                  isHandRaised: p.is_hand_raised,
                  isCreator: p.is_creator
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
                  isHandRaised: p.is_hand_raised,
                  isCreator: p.is_creator
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
              creatorId: room.creator_id, // Add creatorId
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
        
        // Format joined rooms
        const formattedJoinedRooms = (joinedRoomsData || [])
          .filter(item => item.rooms) // Make sure room exists
          .map(item => {
            const room = item.rooms;
            const roomParticipants = participantsData?.filter(p => p.room_id === room.id) || [];
            
            // Skip rooms with no participants
            if (roomParticipants.length === 0) {
              return null;
            }
            
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
                  isHandRaised: p.is_hand_raised,
                  isCreator: p.is_creator
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
                  isHandRaised: p.is_hand_raised,
                  isCreator: p.is_creator
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
              creatorId: room.creator_id, // Add creatorId
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
  }, [user]);
  
  // Filter rooms by search term
  const filteredCreatedRooms = createdRooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.name.toLowerCase().includes(searchLower) ||
      (room.description?.toLowerCase().includes(searchLower)) ||
      (room.topic?.toLowerCase().includes(searchLower))
    );
  });
  
  const filteredJoinedRooms = joinedRooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.name.toLowerCase().includes(searchLower) ||
      (room.description?.toLowerCase().includes(searchLower)) ||
      (room.topic?.toLowerCase().includes(searchLower))
    );
  });
  
  const hasRooms = filteredCreatedRooms.length > 0 || filteredJoinedRooms.length > 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={!!user} userName={user?.user_metadata?.name || user?.user_metadata?.username || "User"} isModerator={user?.user_metadata?.isModerator} />
      
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
          ) : hasRooms ? (
            <Tabs defaultValue="created" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="created">My Created Rooms</TabsTrigger>
                <TabsTrigger value="joined">My Joined Rooms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="created">
                {filteredCreatedRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCreatedRooms.map((room) => (
                      <RoomCard key={room.id} room={room} isCreated={true} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <h2 className="text-xl font-medium">No created rooms found</h2>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try a different search" : "Create a room to get started"}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="joined">
                {filteredJoinedRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJoinedRooms.map((room) => (
                      <RoomCard key={room.id} room={room} isCreated={false} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <h2 className="text-xl font-medium">No joined rooms found</h2>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try a different search" : "Join a room to see it here"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
