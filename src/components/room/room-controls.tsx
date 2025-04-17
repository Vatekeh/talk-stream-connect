
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Hand, 
  Mic, 
  MicOff, 
  Share2, 
  MessageSquare, 
  Users, 
  X,
  LogOut
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "@/types";

interface RoomControlsProps {
  roomId: string;
  currentUser?: User;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  onLeaveRoom: () => void;
}

export function RoomControls({ 
  roomId, 
  currentUser,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  onLeaveRoom
}: RoomControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // This would be replaced with actual Supabase functionality
  };
  
  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
    // This would be replaced with actual Supabase functionality
  };
  
  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join my TalkStream room",
        text: "I'm in a live audio room. Join me!",
        url: window.location.href,
      }).catch((err) => {
        console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Room link copied to clipboard!");
    }
  };
  
  return (
    <div className="w-full bg-background border-t py-3 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleMute}
                className={isMuted ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isMuted ? "Unmute" : "Mute"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleHand}
                className={isHandRaised ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
              >
                <Hand size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isHandRaised ? "Lower hand" : "Raise hand"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onToggleParticipants}
                className={isParticipantsOpen ? "bg-talkstream-purple/10 border-talkstream-purple/20 text-talkstream-purple" : ""}
              >
                {isParticipantsOpen && isMobile ? <X size={20} /> : <Users size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isParticipantsOpen && isMobile ? "Close participants" : "View participants"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onToggleChat}
                className={isChatOpen ? "bg-talkstream-purple/10 border-talkstream-purple/20 text-talkstream-purple" : ""}
              >
                {isChatOpen && isMobile ? <X size={20} /> : <MessageSquare size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isChatOpen && isMobile ? "Close chat" : "Open chat"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={shareRoom}>
                <Share2 size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Share room
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={onLeaveRoom}
              >
                <LogOut size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Leave room
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
