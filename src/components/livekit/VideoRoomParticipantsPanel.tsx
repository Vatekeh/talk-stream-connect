
import { MicOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoRoomParticipantsPanelProps {
  localParticipant: any;
  isMicrophoneEnabled: boolean;
  remoteParticipants: any[];
  open: boolean;
  count: number;
}

export function VideoRoomParticipantsPanel({
  localParticipant,
  isMicrophoneEnabled,
  remoteParticipants,
  open,
  count
}: VideoRoomParticipantsPanelProps) {
  if (!open) return null;

  return (
    <div className="w-64 border-l border-border p-4">
      <h3 className="text-lg font-medium mb-4">Participants ({count})</h3>
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
