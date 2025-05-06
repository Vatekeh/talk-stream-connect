
import { User } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ParticipantRow } from "./participant-row";

interface ParticipantListProps {
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser?: User | null;
  roomId: string;
  onKickUser?: (userId: string) => void;
}

export function ParticipantList({ 
  speakers, 
  participants, 
  hostId, 
  currentUser,
  roomId,
  onKickUser
}: ParticipantListProps) {
  const isHost = currentUser?.id === hostId;
  const isModerator = currentUser?.isModerator;
  
  const canModerate = isHost || isModerator;
  
  return (
    <div className="flex flex-col h-full bg-background rounded-lg border overflow-hidden">
      <div className="px-4 py-2 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">Participants</h3>
      </div>
      
      <ScrollArea className="flex-1">
        {speakers.length > 0 && (
          <div className="p-2">
            <h4 className="text-xs font-medium text-muted-foreground mb-1 px-1">
              SPEAKERS ({speakers.length})
            </h4>
            <div className="space-y-1">
              {speakers.map((user) => (
                <ParticipantRow
                  key={user.id}
                  user={user}
                  hostId={hostId}
                  currentUser={currentUser}
                  canModerate={canModerate}
                  roomId={roomId}
                  onKickUser={onKickUser}
                />
              ))}
            </div>
          </div>
        )}
        
        {participants.length > 0 && (
          <div className="p-2">
            <h4 className="text-xs font-medium text-muted-foreground mb-1 px-1">
              PARTICIPANTS ({participants.length})
            </h4>
            <div className="space-y-1">
              {participants.map((user) => (
                <ParticipantRow
                  key={user.id}
                  user={user}
                  hostId={hostId}
                  currentUser={currentUser}
                  canModerate={canModerate}
                  roomId={roomId}
                  onKickUser={onKickUser}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
