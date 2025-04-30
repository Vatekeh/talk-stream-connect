
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

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  
  // Agora context for audio functionality
  const { joinChannel, leaveChannel, remoteUsers, isMuted, toggleMute } = useAgora();
  
  const [isChatOpen, setIsChatOpen] = useState(!isMobile);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(!isMobile);
  
  // Fetch room data using custom hook
  const { room, isLoading, currentUserParticipant, setCurrentUserParticipant } = useRoomData(roomId);
  
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
  
  // Join Agora channel when component mounts
  useEffect(() => {
    if (roomId && !isLoading && room) {
      joinChannel(roomId);
    }
    
    return () => {
      leaveChannel();
    };
  }, [roomId, isLoading, room]);
  
  // Update mute status when Agora mute changes
  useEffect(() => {
    if (roomId && user && currentUserParticipant?.isSpeaker) {
      const updateMuteStatus = async () => {
        const { error } = await supabase
          .from('room_participants')
          .update({ is_muted: isMuted })
          .eq('room_id', roomId)
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error updating mute status:", error);
        }
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
    return <RoomLoading user={user} />;
  }
  
  if (!room) {
    return <RoomNotFound user={user} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={!!user} 
        userName={user?.user_metadata?.name || user?.user_metadata?.username || "User"} 
        isModerator={currentUserParticipant?.isModerator} 
      />
      
      <main className="flex-1 container flex flex-col py-4">
        <RoomHeader room={room} participantCount={participantCount} />
        
        <RoomContent 
          roomId={room.id}
          speakers={room.speakers}
          participants={room.participants}
          hostId={room.hostId}
          currentUser={currentUserParticipant}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          remoteUsers={remoteUsers}
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
        />
      </main>
    </div>
  );
}
