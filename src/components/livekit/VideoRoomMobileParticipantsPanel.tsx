
import { Button } from "@/components/ui/button";
import { MicOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoRoomMobileParticipantsPanelProps {
  localParticipant: any;
  isMicrophoneEnabled: boolean;
  remoteParticipants: any[];
  onClose: () => void;
  count: number;
}

export function VideoRoomMobileParticipantsPanel({
  localParticipant,
  isMicrophoneEnabled,
  remoteParticipants,
  onClose,
  count
}: VideoRoomMobileParticipantsPanelProps) {
  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Participants ({count})</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
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
          {remoteParticipants.map((participant: any) => (
            <li key={participant.sid} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent">
              <span>{participant.identity}</span>
              {participant.isMicrophoneEnabled === false && <MicOff size={16} className="text-muted-foreground" />}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
