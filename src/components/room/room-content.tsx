
/**
 * RoomContent Component
 * 
 * Manages the layout and display of the main content area in a room.
 * Handles responsive design for chat and participants panels.
 */
import { User } from "@/types";
import { RoomChat } from "./room-chat";
import { ParticipantList } from "./participant-list";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMemo } from "react";

interface RoomContentProps {
  roomId: string;
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser: User | null;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  remoteUsers: any[]; // Using any for now, but should be properly typed based on Agora types
}

export function RoomContent({
  roomId,
  speakers,
  participants,
  hostId,
  currentUser,
  isChatOpen,
  isParticipantsOpen,
  remoteUsers
}: RoomContentProps) {
  // Check if device is mobile for responsive layout
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Memoize the participant list component to prevent unnecessary re-renders
  const memoizedParticipantList = useMemo(() => (
    <ParticipantList 
      speakers={speakers} 
      participants={participants} 
      hostId={hostId}
      currentUser={currentUser}
      roomId={roomId} // Pass roomId to ParticipantList
    />
  ), [speakers, participants, hostId, currentUser, roomId]);
  
  // Memoize the chat component to prevent unnecessary re-renders
  const memoizedChat = useMemo(() => (
    <RoomChat roomId={roomId} messages={[]} />
  ), [roomId]);
  
  // Memoize the connection status display
  const connectionStatus = useMemo(() => (
    <div className="text-center">
      <h2 className="text-xl font-medium mb-2">Audio Room</h2>
      <p className="text-muted-foreground">
        {remoteUsers.length > 0 
          ? `Connected with ${remoteUsers.length} other participants` 
          : 'Waiting for others to join...'}
      </p>
    </div>
  ), [remoteUsers.length]);
  
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
      {/* Main content area - hidden on mobile when chat/participants are open */}
      <div className={`md:col-span-2 lg:col-span-3 flex flex-col rounded-xl bg-accent p-4 ${isMobile && (isChatOpen || isParticipantsOpen) ? 'hidden' : ''}`}>
        <div className="flex-1 flex items-center justify-center">
          {/* Audio visualization or room status */}
          {connectionStatus}
        </div>
      </div>
      
      {/* Mobile: Show either chat or participants, but not both */}
      {isMobile ? (
        <>
          {/* Mobile chat panel */}
          {isChatOpen && (
            <div className="h-[calc(100vh-300px)]">
              {memoizedChat}
            </div>
          )}
          
          {/* Mobile participants panel */}
          {isParticipantsOpen && (
            <div className="h-[calc(100vh-300px)]">
              {memoizedParticipantList}
            </div>
          )}
        </>
      ) : (
        // Desktop: Show both based on toggle state
        <>
          {/* Desktop chat panel */}
          {isChatOpen && (
            <div className="h-[calc(100vh-300px)]">
              {memoizedChat}
            </div>
          )}
          
          {/* Desktop participants panel - hidden on medium screens when chat is open */}
          {isParticipantsOpen && (
            <div className={`h-[calc(100vh-300px)] ${isChatOpen ? 'hidden lg:block' : ''}`}>
              {memoizedParticipantList}
            </div>
          )}
        </>
      )}
    </div>
  );
}
