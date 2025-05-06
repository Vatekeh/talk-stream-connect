
import React from "react";
import { Room, User } from "@/types";
import { MobileSheetRef } from "@/components/room/mobile/mobile-sheet";
import { RoomHeader } from "@/components/room/room-header";
import { MobileRoomHeader } from "@/components/room/mobile/mobile-room-header";
import { RoomContent } from "@/components/room/room-content";
import { RoomControls } from "@/components/room/room-controls";
import { MobileRoomControls } from "@/components/room/mobile/mobile-room-controls";
import { MobileSheet } from "@/components/room/mobile/mobile-sheet";

interface RoomLayoutProps {
  room: Room;
  user: any;
  currentUserParticipant: User | null | undefined;
  isCreator: boolean;
  participantCount: number;
  isMobile: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  remoteUsers: any[];
  isHandRaised: boolean;
  toggleHand: () => void;
  handleLeaveRoom: () => void;
  toggleChat: () => void;
  toggleParticipants: () => void;
  isTransitioning: boolean;
  connectionState: string;
  mobileSheetRef: React.RefObject<MobileSheetRef>;
  handleKickUser: (userId: string) => void;
}

export function RoomLayout({
  room,
  user,
  currentUserParticipant,
  isCreator,
  participantCount,
  isMobile,
  isChatOpen,
  isParticipantsOpen,
  remoteUsers,
  isHandRaised,
  toggleHand,
  handleLeaveRoom,
  toggleChat,
  toggleParticipants,
  isTransitioning,
  connectionState,
  mobileSheetRef,
  handleKickUser
}: RoomLayoutProps) {
  
  // Determine if user can use mic (speakers only)
  const canUseMic = currentUserParticipant?.isSpeaker || false;
  
  return (
    <main className="flex-1 container flex flex-col py-4 relative">
      {isMobile ? (
        <MobileRoomHeader 
          room={room} 
          participantCount={participantCount} 
        />
      ) : (
        <RoomHeader 
          room={room} 
          participantCount={participantCount} 
          currentUserId={user?.id}
          onExitRoom={handleLeaveRoom}
          isCreator={isCreator}
        />
      )}
      
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
      
      {isMobile ? (
        <>
          <MobileRoomControls 
            sheetRef={mobileSheetRef}
            isHandRaised={isHandRaised}
            onToggleHand={toggleHand}
            canUseMic={canUseMic}
            isTransitioning={isTransitioning}
            connectionState={connectionState}
            onOpenInvite={() => {/* Implement invite function */}}
          />
          
          <MobileSheet 
            ref={mobileSheetRef}
            roomId={room.id}
            speakers={room.speakers}
            participants={room.participants}
            hostId={room.hostId}
            currentUser={currentUserParticipant}
            onKickUser={handleKickUser}
          />
        </>
      ) : (
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
      )}
    </main>
  );
}
