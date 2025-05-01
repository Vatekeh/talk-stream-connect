
import { User } from "@/types";
import { MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { updateParticipantStatus, removeParticipant } from "./participant-utils";

interface ParticipantControlsProps {
  user: User;
  currentUser: User | null | undefined;
  hostId: string;
  canModerate: boolean;
}

export function ParticipantControls({ 
  user, 
  currentUser, 
  hostId,
  canModerate 
}: ParticipantControlsProps) {
  if (!canModerate && user.id !== currentUser?.id) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {canModerate && user.id !== currentUser?.id && (
          <>
            {user.isSpeaker ? (
              <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_speaker: false })}>
                Remove as speaker
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_speaker: true, is_muted: false })}>
                Make speaker
              </DropdownMenuItem>
            )}
            
            {user.isModerator ? (
              <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_moderator: false })}>
                Remove as moderator
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_moderator: true })}>
                Make moderator
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => removeParticipant(user.id)}
            >
              Remove from room
            </DropdownMenuItem>
          </>
        )}
        
        {user.id === currentUser?.id && (
          <>
            {user.isSpeaker && (
              user.isMuted ? (
                <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_muted: false })}>
                  Unmute
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_muted: true })}>
                  Mute
                </DropdownMenuItem>
              )
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
