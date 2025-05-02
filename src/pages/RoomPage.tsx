
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAgora } from "@/contexts/AgoraContext";
import { useAuth } from "@/contexts/AuthContext";
import { mockMessages } from "@/lib/mock-data";
import { RoomHeader } from "@/components/room/room-header";
import { RoomContent } from "@/components/room/room-content";
import { RoomControls } from "@/components/room/room-controls";
import { RoomLoading } from "@/components/room/room-loading";
import { RoomNotFound } from "@/components/room/room-not-found";
import { useRoomData } from "@/hooks/use-room-data";
import { useRoomActions } from "@/hooks/use-room-actions";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import { kickParticipant } from "@/components/room/participant-utils";
import { toast } from "sonner";

export default function RoomPage() {
  // Use empty deps effect to correctly count actual mounts/unmounts
  useEffect(() => {
    console.count("RoomPage mounted");
    return () => console.count("RoomPage unmounted");
  }, []);
  
  const { roomId } = useParams<{ roomId: string }>();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  
  // Agora context for audio functionality
  const { joinChannel, leaveChannel, remoteUsers, isMuted, toggleMute, connectionState } = useAgora();
  
  const [isChatOpen, setIsChatOpen] = useState(!isMobile);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(!isMobile);
  
  // Fetch room data using custom hook
  const { room, isLoading, error, currentUserParticipant, setCurrentUserParticipant } = useRoomData(roomId);
  
  // Room actions using custom hook
  const { 
    isHandRaised, 
    joinRoom, 
    toggleHand, 
    handleLeaveRoom 
  } = useRoomActions(roomId, user, currentUserParticipant);
  
  // Join room if not already joined
  useEffect(() => {
    if (!isLoading && room && user && !currentUserParticipant) {
      joinRoom();
    }
  }, [isLoading, room, user, currentUserParticipant]);
  
  // Join Agora channel when component mounts and room data is available
  // FIXED: Only use stableRoomId (primitive) as dependency to prevent remounting loops
  const stableRoomId = room?.id;
  
  useEffect(() => {
    if (!stableRoomId) return;
    
    console.log("[Room] Initiating Agora join for", stableRoomId);
    // Using numeric uid for better stability
    const numericUid = user?.id ? parseInt(user.id.replace(/-/g, "").substring(0, 6), 16) : undefined;
    joinChannel(stableRoomId, numericUid);
    
    return () => {
      console.log("[Room] Cleanup for", stableRoomId);
      leaveChannel();
    };
  }, [stableRoomId, user?.id]); // Only depend on the stable ID values
  
  // Update mute status when Agora mute changes - in separate effect
  useEffect(() => {
    if (roomId && user && currentUserParticipant?.isSpeaker) {
      const updateMuteStatus = async () => {
        const { error } = await supabase
          .from('room_participants')
          .update({ is_muted: isMuted })
          .eq('room_id', roomId)
          .eq('user_id', user.id);
          
        if (error) {
          console.error("[RoomPage] Error updating mute status:", error);
        }
      };
      
      updateMuteStatus();
    }
  }, [isMuted, roomId, user, currentUserParticipant]);
  
  // Handle kick user functionality
  const handleKickUser = async (userId: string) => {
    if (!roomId || !user || !user.id) return;
    
    try {
      await kickParticipant(roomId, userId, user.id);
    } catch (error) {
      console.error("[RoomPage] Error kicking user:", error);
      toast.error("Failed to kick user from room");
    }
  };
  
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
    return <RoomLoading user={user} />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader 
          isAuthenticated={!!user} 
          userName={user?.user_metadata?.name || user?.user_metadata?.username || "User"} 
        />
        <main className="flex-1 container flex flex-col items-center justify-center py-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error loading room</h1>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Could not load room data. The database query failed with error: {error.message}
          </p>
          <p className="text-sm text-muted-foreground">{roomId}</p>
        </main>
      </div>
    );
  }
  
  if (!room) {
    return <RoomNotFound user={user} />;
  }

  // Check if the current user is the creator of the room
  const isCreator = user && room.hostId === user.id;
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={!!user} 
        userName={user?.user_metadata?.name || user?.user_metadata?.username || "User"} 
        isModerator={currentUserParticipant?.isModerator} 
      />
      
      <main className="flex-1 container flex flex-col py-4">
        <RoomHeader 
          room={room} 
          participantCount={participantCount} 
          currentUserId={user?.id}
          onExitRoom={!isCreator ? handleLeaveRoom : undefined}
          isCreator={isCreator}
        />
        
        <RoomContent 
          roomId={room.id}
          speakers={room.speakers}
          participants={room.participants}
          hostId={room.hostId}
          currentUser={currentUserParticipant}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          remoteUsers={remoteUsers}
          onKickUser={handleKickUser}
        />
        
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
          connectionState={connectionState}
        />
      </main>
    </div>
  );
}
