
import { User } from "@/types";
import { Hand } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserStatusIcon, MicStatus } from "./participant-status";
import { ParticipantControls } from "./participant-controls";
import { getInitials } from "./participant-utils";
import { Button } from "@/components/ui/button";

interface ParticipantRowProps {
  user: User;
  hostId: string;
  currentUser: User | null | undefined;
  canModerate: boolean;
  roomId: string;
  onKickUser?: (userId: string) => void;
}

export function ParticipantRow({ 
  user, 
  hostId, 
  currentUser, 
  canModerate,
  roomId,
  onKickUser
}: ParticipantRowProps) {
  const isCurrentUser = currentUser?.id === user.id;
  
  return (
    <div 
      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name || "User"} />
          <AvatarFallback className="bg-talkstream-purple text-white">
            {getInitials(user.name || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{user.name || "Anonymous"}</span>
          <UserStatusIcon user={user} hostId={hostId} />
        </div>
      </div>
      
      <div className="flex items-center">
        {!user.isSpeaker && user.isHandRaised && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Hand size={14} className="text-amber-500 mr-2" />
              </TooltipTrigger>
              <TooltipContent>Hand Raised</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <MicStatus user={user} />
        
        <div className="flex items-center gap-2">
          {/* Add Kick button for moderators */}
          {canModerate && !isCurrentUser && onKickUser && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onKickUser(user.id)} 
              className="h-7 py-0 text-xs text-destructive hover:bg-destructive/10"
            >
              Kick
            </Button>
          )}
          
          <ParticipantControls 
            user={user} 
            currentUser={currentUser} 
            hostId={hostId}
            canModerate={canModerate}
            roomId={roomId} 
          />
        </div>
      </div>
    </div>
  );
}
