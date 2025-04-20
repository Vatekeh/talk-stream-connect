
/**
 * VideoRoomParticipantsPanel
 * 
 * Side panel showing a list of participants in a LiveKit video room.
 * - Shows both the local user and all remote participants.
 * - Indicates if a participant's microphone is disabled.
 * - Only renders if `open` prop is true.
 * 
 * Props:
 *   - localParticipant: Object representing local user (may be null)
 *   - isMicrophoneEnabled: Boolean, true if local user's mic is enabled
 *   - remoteParticipants: Array of remote user participant objects
 *   - open: Boolean, whether panel is shown
 *   - count: Number of total participants (local + remote)
 */

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
      {/* List of Participants, scrollable if overflow */}
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

