
import { User } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ParticipantRow } from "./participant-row";

interface ParticipantListProps {
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser?: User | null;
}

export function ParticipantList({ 
  speakers, 
  participants, 
  hostId, 
  currentUser 
}: ParticipantListProps) {
  const isHost = currentUser?.id === hostId;
  const isModerator = currentUser?.isModerator;
  
  const canModerate = isHost || isModerator;
  
  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden border">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium">Participants</h3>
      </div>
      
      <ScrollArea className="flex-1">
        {speakers.length > 0 && (
          <div className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
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
                />
              ))}
            </div>
          </div>
        )}
        
        {participants.length > 0 && (
          <div className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
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
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
