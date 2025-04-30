import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { RoomChat } from "@/components/room/room-chat";
import { ParticipantList } from "@/components/room/participant-list";
import { RoomControls } from "@/components/room/room-controls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgePulse } from "@/components/ui/badge-pulse";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users } from "lucide-react";
import { Room, User } from "@/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Link } from "react-router-dom";
import { useAgora } from "@/contexts/AgoraContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { mockMessages } from "@/lib/mock-data";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  
  // Agora context for audio functionality
  const { joinChannel, leaveChannel, remoteUsers, isMuted, toggleMute } = useAgora();
  
  const [isChatOpen, setIsChatOpen] = useState(!isMobile);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(!isMobile);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserParticipant, setCurrentUserParticipant] = useState<User | null>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
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
        
      if (roomError) throw roomError;
      
      // Get room participants with profiles
      const { data: participantsData, error: participantsError } = await supabase
        .from('room_participants')
        .select(`
          *,
          profiles(id, username, avatar_url, bio)
        `)
        .eq('room_id', roomId);
        
      if (participantsError) throw participantsError;
      
      // Format participants
      const speakers = participantsData
        .filter(p => p.is_speaker)
        .map(p => {
          const profile = p.profiles || {};
          return {
            id: p.user_id,
            name: profile.username || 'Anonymous',
            avatar: profile.avatar_url,
            isModerator: p.is_moderator,
            isSpeaker: true,
            isMuted: p.is_muted,
            isHandRaised: p.is_hand_raised,
            pronouns: profile.pronouns,
            bio: profile.bio
          };
        });
        
      const participants = participantsData
        .filter(p => !p.is_speaker)
        .map(p => {
          const profile = p.profiles || {};
          return {
            id: p.user_id,
            name: profile.username || 'Anonymous',
            avatar: profile.avatar_url,
            isModerator: p.is_moderator,
            isSpeaker: false,
            isMuted: p.is_muted,
            isHandRaised: p.is_hand_raised,
            pronouns: profile.pronouns,
            bio: profile.bio
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
        hostName: hostProfile.username || 'Anonymous',
        hostAvatar: hostProfile.avatar_url,
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
        
        if (userParticipant) {
          setIsHandRaised(userParticipant.isHandRaised || false);
        } else {
          // Join the room as a participant if not already in
          await joinRoom();
        }
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      toast({
        title: "Error loading room",
        description: "Could not load room data. The room may no longer exist.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to join the room
  const joinRoom = async () => {
    if (!roomId || !user) return;
    
    try {
      // Check if user is already in the room
      const { data, error: checkError } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If not already in the room, add them
      if (!data) {
        const { error } = await supabase
          .from('room_participants')
          .insert({
            room_id: roomId,
            user_id: user.id,
            is_speaker: false,
            is_moderator: false,
            is_muted: true
          });
          
        if (error) throw error;
        
        toast({
          title: "Joined room",
          description: "You have joined the room as a listener.",
        });
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };
  
  // Function to leave the room
  const leaveRoom = async () => {
    if (!roomId || !user) return;
    
    try {
      // Remove user from participants
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Left room",
        description: "You have left the room.",
      });
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };
  
  // Function to toggle hand raised
  const toggleHand = async () => {
    if (!roomId || !user) return;
    
    try {
      const newHandRaised = !isHandRaised;
      
      // Update hand raised status
      const { error } = await supabase
        .from('room_participants')
        .update({ is_hand_raised: newHandRaised })
        .eq('room_id', roomId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setIsHandRaised(newHandRaised);
      
      toast({
        title: newHandRaised ? "Hand raised" : "Hand lowered",
        description: newHandRaised 
          ? "The host will see that you'd like to speak." 
          : "You've lowered your hand.",
      });
    } catch (error) {
      console.error("Error toggling hand:", error);
    }
  };
  
  // Handle leaving the room
  const handleLeaveRoom = async () => {
    await leaveChannel();
    await leaveRoom();
  };
  
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
  
  // Initial load
  useEffect(() => {
    fetchRoomData();
  }, [roomId, user]);
  
  // Join Agora channel when component mounts
  useEffect(() => {
    if (roomId && !isLoading) {
      joinChannel(roomId);
    }
    
    return () => {
      leaveChannel();
    };
  }, [roomId, isLoading]);
  
  // Update mute status when Agora mute changes
  useEffect(() => {
    if (roomId && user && currentUserParticipant?.isSpeaker) {
      const updateMuteStatus = async () => {
        await supabase
          .from('room_participants')
          .update({ is_muted: isMuted })
          .eq('room_id', roomId)
          .eq('user_id', user.id);
      };
      
      updateMuteStatus();
    }
  }, [isMuted, roomId, user, currentUserParticipant]);
  
  const toggleChat = () => {
    if (isMobile) {
      setIsChatOpen(!isChatOpen);
      setIsParticipantsOpen(false);
    } else {
      setIsChatOpen(!isChatOpen);
    }
  };
  
  const toggleParticipants = () => {
    if (isMobile) {
      setIsParticipantsOpen(!isParticipantsOpen);
      setIsChatOpen(false);
    } else {
      setIsParticipantsOpen(!isParticipantsOpen);
    }
  };
  
  // Calculate participants including remote Agora users
  const participantCount = room 
    ? room.speakers.length + room.participants.length + remoteUsers.length
    : 0;
  
  // Set document title
  useEffect(() => {
    if (room) {
      document.title = `${room.name} | Audio Room`;
    }
    return () => {
      document.title = "Audio Room";
    };
  }, [room?.name]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader isAuthenticated={!!user} userName={user?.user_metadata?.name || "User"} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader isAuthenticated={!!user} userName={user?.user_metadata?.name || "User"} />
        <div className="flex-1 container flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <p className="text-muted-foreground mb-6">The room you're looking for doesn't exist or has ended.</p>
          <Button asChild>
            <Link to="/">Go back to rooms</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={!!user} userName={user?.user_metadata?.name || "User"} isModerator={currentUserParticipant?.isModerator} />
      
      <main className="flex-1 container flex flex-col py-4">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="gap-1 mb-2">
            <Link to="/">
              <ChevronLeft size={16} />
              Back to Rooms
            </Link>
          </Button>
          
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BadgePulse color="purple">LIVE</BadgePulse>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users size={14} className="mr-1" />
                  {participantCount} Participants
                </div>
              </div>
              
              <h1 className="text-2xl font-bold">{room.name}</h1>
              {room.description && <p className="text-muted-foreground">{room.description}</p>}
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={room.hostAvatar} alt={room.hostName} />
                <AvatarFallback className="bg-talkstream-purple text-white">
                  {room.hostName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{room.hostName}</p>
                <p className="text-xs text-muted-foreground">Host</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <div className={`md:col-span-2 lg:col-span-3 flex flex-col rounded-xl bg-accent p-4 ${isMobile && (isChatOpen || isParticipantsOpen) ? 'hidden' : ''}`}>
            <div className="flex-1 flex items-center justify-center">
              {/* Audio visualization or room status */}
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">Audio Room</h2>
                <p className="text-muted-foreground">
                  {remoteUsers.length > 0 
                    ? `Connected with ${remoteUsers.length} other participants` 
                    : 'Waiting for others to join...'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Mobile: Show either chat or participants, but not both */}
          {isMobile ? (
            <>
              {isChatOpen && (
                <div className="h-[calc(100vh-300px)]">
                  <RoomChat roomId={room.id} messages={mockMessages} />
                </div>
              )}
              
              {isParticipantsOpen && (
                <div className="h-[calc(100vh-300px)]">
                  <ParticipantList 
                    speakers={room.speakers} 
                    participants={room.participants} 
                    hostId={room.hostId}
                    currentUser={currentUserParticipant}
                  />
                </div>
              )}
            </>
          ) : (
            // Desktop: Show both based on toggle state
            <>
              {isChatOpen && (
                <div className="h-[calc(100vh-300px)]">
                  <RoomChat roomId={room.id} messages={mockMessages} />
                </div>
              )}
              
              {isParticipantsOpen && (
                <div className={`h-[calc(100vh-300px)] ${isChatOpen ? 'hidden lg:block' : ''}`}>
                  <ParticipantList 
                    speakers={room.speakers} 
                    participants={room.participants} 
                    hostId={room.hostId}
                    currentUser={currentUserParticipant}
                  />
                </div>
              )}
            </>
          )}
        </div>
        
        <RoomControls 
          roomId={room.id}
          currentUser={currentUserParticipant}
          onToggleChat={toggleChat}
          onToggleParticipants={toggleParticipants}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          onLeaveRoom={handleLeaveRoom}
          onToggleHand={toggleHand}
          isHandRaised={isHandRaised}
        />
      </main>
    </div>
  );
}
