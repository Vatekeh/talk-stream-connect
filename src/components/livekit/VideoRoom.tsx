
import { useEffect, useState } from "react";
import { useLiveKit } from "@/contexts/LiveKitContext";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  LogOut,
  Users
} from "lucide-react";
import { ParticipantView } from "./ParticipantView";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

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
  
  // Join room on component mount
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      joinRoom(roomName).catch(err => {
        console.error("Error joining room:", err);
        toast.error("Failed to join room");
      });
    }
    
    // Clean up on unmount
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
        
        {!isMobile && participantsListOpen && (
          <div className="w-64 border-l border-border p-4">
            <h3 className="text-lg font-medium mb-4">Participants ({1 + remoteParticipants.length})</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <ul className="space-y-2">
                {localParticipant && (
                  <li className="flex items-center justify-between py-2 px-3 rounded-md bg-accent">
                    <span>{localParticipant.identity} (You)</span>
                    {!isMicrophoneEnabled && <MicOff size={16} className="text-muted-foreground" />}
                  </li>
                )}
                
                {remoteParticipants.map(participant => (
                  <li key={participant.sid} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent">
                    <span>{participant.identity}</span>
                    {participant.isMicrophoneEnabled === false && <MicOff size={16} className="text-muted-foreground" />}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </div>
      
      {isMobile && participantsListOpen && (
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Participants ({1 + remoteParticipants.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => setParticipantsListOpen(false)}>
              Close
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <ul className="space-y-2">
              {localParticipant && (
                <li className="flex items-center justify-between py-2 px-3 rounded-md bg-accent">
                  <span>{localParticipant.identity} (You)</span>
                  {!isMicrophoneEnabled && <MicOff size={16} className="text-muted-foreground" />}
                </li>
              )}
              
              {remoteParticipants.map(participant => (
                <li key={participant.sid} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent">
                  <span>{participant.identity}</span>
                  {participant.isMicrophoneEnabled === false && <MicOff size={16} className="text-muted-foreground" />}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
      
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMicrophone}
            className={!isMicrophoneEnabled ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
          >
            {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            className={!isCameraEnabled ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
          >
            {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParticipantsListOpen(!participantsListOpen)}
            className={participantsListOpen ? "bg-talkstream-purple/10 border-talkstream-purple/20 text-talkstream-purple" : ""}
          >
            <Users size={20} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleLeave}
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
