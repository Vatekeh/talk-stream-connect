
import { User } from "@/types";
import { Hand, Mic, MicOff, ShieldAlert, ShieldCheck, User as UserIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserStatusIconProps {
  user: User;
  hostId: string;
}

export function UserStatusIcon({ user, hostId }: UserStatusIconProps) {
  if (user.id === hostId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ShieldCheck size={14} className="text-talkstream-purple" />
          </TooltipTrigger>
          <TooltipContent>Host</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (user.isModerator) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ShieldAlert size={14} className="text-talkstream-purple" />
          </TooltipTrigger>
          <TooltipContent>Moderator</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (user.isHandRaised) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Hand size={14} className="text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>Hand Raised</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return null;
}

interface MicStatusProps {
  user: User;
}

export function MicStatus({ user }: MicStatusProps) {
  if (user.isSpeaker) {
    return user.isMuted ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <MicOff size={14} className="text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>Microphone Off</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Mic size={14} className="text-green-500" />
          </TooltipTrigger>
          <TooltipContent>Microphone On</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <UserIcon size={14} className="text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>Listener</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
