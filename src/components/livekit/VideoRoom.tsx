import { useEffect, useState } from "react";
import { useLiveKit } from "@/contexts/useLiveKit";
import { ParticipantView } from "./ParticipantView";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { VideoRoomParticipantsPanel } from "./VideoRoomParticipantsPanel";
import { VideoRoomMobileParticipantsPanel } from "./VideoRoomMobileParticipantsPanel";
import { VideoRoomControls } from "./VideoRoomControls";

interface VideoRoomProps {
  roomName: string;
  onLeave?: () => void;
}

export function VideoRoom({ roomName, onLeave }: VideoRoomProps) {
  const {
    joinRoom,
    leaveRoom,
    isConnecting,
    isConnected,
    localParticipant,
    remoteParticipants,
    toggleMicrophone,
    toggleCamera,
    isMicrophoneEnabled,
    isCameraEnabled
  } = useLiveKit();

  const isMobile = useMediaQuery("(max-width: 640px)");
  const [participantsListOpen, setParticipantsListOpen] = useState(false);

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      joinRoom(roomName).catch(err => {
        console.error("Error joining room:", err);
        toast.error("Failed to join room");
      });
    }
    return () => {
      if (isConnected) {
        leaveRoom();
      }
    };
  }, [roomName, joinRoom, leaveRoom, isConnected, isConnecting]);

  const handleLeave = () => {
    leaveRoom();
    if (onLeave) {
      onLeave();
    }
  };

  const getGridClassName = () => {
    const count = 1 + remoteParticipants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-talkstream-purple"></div>
        <span className="ml-2">Connecting to room...</span>
      </div>
    );
  }

  const participantsCount = 1 + remoteParticipants.length;

  return (
    <div className="h-full flex flex-col">
      <div className={`flex-1 flex ${participantsListOpen && isMobile ? 'hidden' : 'flex'}`}>
        <div className="flex-1 flex flex-col">
          <div className={`flex-1 grid ${getGridClassName()} gap-4 p-4`}>
            {localParticipant && (
              <ParticipantView
                participant={localParticipant}
                isLocal={true}
                isMuted={!isMicrophoneEnabled}
                isVideoEnabled={isCameraEnabled}
              />
            )}
            {remoteParticipants.map(participant => (
              <ParticipantView
                key={participant.sid}
                participant={participant}
                isLocal={false}
              />
            ))}
          </div>
        </div>

        {!isMobile && (
          <VideoRoomParticipantsPanel
            localParticipant={localParticipant}
            isMicrophoneEnabled={isMicrophoneEnabled}
            remoteParticipants={remoteParticipants}
            open={participantsListOpen}
            count={participantsCount}
          />
        )}
      </div>

      {isMobile && participantsListOpen && (
        <VideoRoomMobileParticipantsPanel
          localParticipant={localParticipant}
          isMicrophoneEnabled={isMicrophoneEnabled}
          remoteParticipants={remoteParticipants}
          onClose={() => setParticipantsListOpen(false)}
          count={participantsCount}
        />
      )}

      <VideoRoomControls
        isMicrophoneEnabled={isMicrophoneEnabled}
        isCameraEnabled={isCameraEnabled}
        participantsListOpen={participantsListOpen}
        onToggleMicrophone={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onToggleParticipantsList={() => setParticipantsListOpen(!participantsListOpen)}
        onLeave={handleLeave}
      />
    </div>
  );
}
