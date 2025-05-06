
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { useAuth } from "@/contexts/AuthContext";
import { RoomLoading } from "@/components/room/room-loading";
import { RoomNotFound } from "@/components/room/room-not-found";
import { useRoomData } from "@/hooks/use-room-data";
import { useRoomActions } from "@/hooks/use-room-actions";
import { kickParticipant, checkPreviousRoomStatus } from "@/components/room/participant-utils";
import { toast } from "sonner";
import { RoomLayout } from "@/components/room/room-layout";
import { useRoomUIState } from "@/hooks/use-room-ui-state";
import { useRoomConnection } from "@/hooks/use-room-connection";
import { AlertTriangle } from "lucide-react";

export default function RoomPage() {
  // Use empty deps effect to correctly count actual mounts/unmounts
  useEffect(() => {
    console.count("RoomPage mounted");
    return () => console.count("RoomPage unmounted");
  }, []);
  
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  
  // Get room UI state management
  const { 
    isMobile, 
    isChatOpen, 
    isParticipantsOpen, 
    mobileSheetRef,
    toggleChat, 
    toggleParticipants 
  } = useRoomUIState();
  
  // Fetch room data using custom hook
  const { room, isLoading, error, currentUserParticipant, setCurrentUserParticipant } = useRoomData(roomId);
  
  // Room actions using custom hook
  const { 
    isHandRaised, 
    joinRoom, 
    toggleHand, 
    handleLeaveRoom 
  } = useRoomActions(roomId, user, currentUserParticipant);
  
  // Get room connection state
  const { 
    remoteUsers, 
    isTransitioning, 
    connectionState 
  } = useRoomConnection(room?.id, user, currentUserParticipant);
  
  // Join room if not already joined
  useEffect(() => {
    if (!isLoading && room && user && !currentUserParticipant) {
      joinRoom().then(() => {
        // Check if user was previously the room creator and restore privileges
        checkPreviousRoomStatus(user.id, room.id);
      });
    }
  }, [isLoading, room, user, currentUserParticipant, joinRoom]);
  
  // Set document title
  useEffect(() => {
    if (room) {
      document.title = `${room.name} | Audio Room`;
    }
    return () => {
      document.title = "Audio Room";
    };
  }, [room?.name]);
  
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
  
  // Calculate participants including remote Agora users
  const participantCount = room 
    ? room.speakers.length + room.participants.length + remoteUsers.length
    : 0;
  
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
      
      <RoomLayout
        room={room}
        user={user}
        currentUserParticipant={currentUserParticipant}
        isCreator={isCreator}
        participantCount={participantCount}
        isMobile={isMobile}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        remoteUsers={remoteUsers}
        isHandRaised={isHandRaised}
        toggleHand={toggleHand}
        handleLeaveRoom={handleLeaveRoom}
        toggleChat={toggleChat}
        toggleParticipants={toggleParticipants}
        isTransitioning={isTransitioning}
        connectionState={connectionState}
        mobileSheetRef={mobileSheetRef}
        handleKickUser={handleKickUser}
      />
    </div>
  );
}
