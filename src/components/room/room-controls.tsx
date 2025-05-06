
import { useAgora } from "@/contexts/AgoraContext";
import { useMediaQuery } from "@/hooks/use-media-query";
import { User } from "@/types";
import { ConnectionState } from "@/contexts/agora/types";
import { ConnectionStatus } from "./controls/connection-status";
import { PrimaryControls } from "./controls/primary-controls";
import { SecondaryControls } from "./controls/secondary-controls";
import { CenterTabs } from "./controls/center-tabs";

interface RoomControlsProps {
  roomId: string;
  currentUser?: User | null;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  onLeaveRoom: () => void;
  onToggleHand: () => void;
  isHandRaised: boolean;
  connectionState?: ConnectionState;
}

export function RoomControls({ 
  roomId, 
  currentUser,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  onLeaveRoom,
  onToggleHand,
  isHandRaised,
  connectionState = "disconnected"
}: RoomControlsProps) {
  // Use Agora context for audio control
  const { toggleMute, isMuted } = useAgora();
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Handle mute/unmute with Agora
  const handleToggleMute = async () => {
    await toggleMute();
  };
  
  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join my audio room",
        text: "I'm in a live audio room. Join me!",
        url: window.location.href,
      }).catch((err) => {
        console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Room link copied to clipboard!");
    }
  };
  
  // Determine if user can use mic (speakers only)
  const canUseMic = currentUser?.isSpeaker || false;
  
  // Show connecting indicator when appropriate
  const isTransitioning = connectionState === "connecting" || 
                        connectionState === "disconnecting" || 
                        connectionState === "publishing" ||
                        connectionState === "reconnecting";
  
  return (
    <div className="w-full bg-background border-t py-3 px-4">
      <div className="flex items-center justify-between">
        {/* Left side controls - primary actions */}
        <div className="flex items-center gap-2">
          <PrimaryControls 
            canUseMic={canUseMic}
            isMuted={isMuted}
            isHandRaised={isHandRaised}
            isTransitioning={isTransitioning}
            connectionState={connectionState}
            onToggleMute={handleToggleMute}
            onToggleHand={onToggleHand}
          />
          
          <ConnectionStatus 
            connectionState={connectionState}
            isTransitioning={isTransitioning}
          />
        </div>
        
        {/* Center controls - room widgets */}
        <div className="hidden md:block">
          <CenterTabs 
            isMobile={false}
            isChatOpen={isChatOpen}
            isParticipantsOpen={isParticipantsOpen}
            onToggleChat={onToggleChat}
            onToggleParticipants={onToggleParticipants}
          />
        </div>
        
        {/* Mobile tab buttons */}
        <div className="flex md:hidden gap-2">
          <CenterTabs 
            isMobile={true}
            isChatOpen={isChatOpen}
            isParticipantsOpen={isParticipantsOpen}
            onToggleChat={onToggleChat}
            onToggleParticipants={onToggleParticipants}
          />
        </div>
        
        {/* Right side controls - secondary actions */}
        <SecondaryControls 
          isTransitioning={isTransitioning}
          connectionState={connectionState}
          onLeaveRoom={onLeaveRoom}
          onShareRoom={shareRoom}
        />
      </div>
    </div>
  );
}
