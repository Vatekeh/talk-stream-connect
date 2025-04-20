
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, LogOut, Users } from "lucide-react";

interface VideoRoomControlsProps {
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  participantsListOpen: boolean;
  onToggleMicrophone: () => void;
  onToggleCamera: () => void;
  onToggleParticipantsList: () => void;
  onLeave: () => void;
}

export function VideoRoomControls({
  isMicrophoneEnabled,
  isCameraEnabled,
  participantsListOpen,
  onToggleMicrophone,
  onToggleCamera,
  onToggleParticipantsList,
  onLeave
}: VideoRoomControlsProps) {
  return (
    <div className="p-4 border-t border-border flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleMicrophone}
          className={!isMicrophoneEnabled ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
        >
          {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleCamera}
          className={!isCameraEnabled ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
        >
          {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleParticipantsList}
          className={participantsListOpen ? "bg-talkstream-purple/10 border-talkstream-purple/20 text-talkstream-purple" : ""}
        >
          <Users size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive border-destructive/20 hover:bg-destructive/10"
          onClick={onLeave}
        >
          <LogOut size={20} />
        </Button>
      </div>
    </div>
  );
}
