
import { Button } from "@/components/ui/button";
import { 
  Hand, 
  Mic, 
  MicOff, 
  Share2, 
  MessageSquare, 
  Users, 
  X,
  LogOut,
  Loader2
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "@/types";
import { useAgora } from "@/contexts/AgoraContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RoomControlsProps {
  roomId: string;
  currentUser?: User | null;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  onLeaveRoom: () => void;
  onToggleHand: () => void;
  isHandRaised: boolean;
  connectionState?: "disconnected" | "connecting" | "connected" | "disconnecting" | "publishing" | "reconnecting";
}

export function RoomControls({ 
  roomId, 
  currentUser,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  onLeaveRoom,
  onToggleHand,
  isHandRaised,
  connectionState = "disconnected"
}: RoomControlsProps) {
  // Use Agora context for audio control
  const { toggleMute, isMuted } = useAgora();
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Handle mute/unmute with Agora
  const handleToggleMute = async () => {
    await toggleMute();
  };
  
  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join my audio room",
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
  
  // Determine if user can use mic (speakers only)
  const canUseMic = currentUser?.isSpeaker || false;
  
  // Show connecting indicator when appropriate
  const isTransitioning = connectionState === "connecting" || 
                        connectionState === "disconnecting" || 
                        connectionState === "publishing" ||
                        connectionState === "reconnecting";
  
  // Generate status text based on connection state
  const getConnectionStatusText = () => {
    switch(connectionState) {
      case "connecting": return "Connecting...";
      case "disconnecting": return "Disconnecting...";
      case "publishing": return "Setting up audio...";
      case "reconnecting": return "Reconnecting...";
      default: return "";
    }
  };
  
  return (
    <div className="w-full bg-background border-t py-3 px-4">
      <div className="flex items-center justify-between">
        {/* Left side controls - primary actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={canUseMic ? "outline" : "default"}
                  size="icon" 
                  onClick={canUseMic ? handleToggleMute : onToggleHand}
                  className={isHandRaised && !canUseMic ? "bg-amber-50 border-amber-200 text-amber-700" : 
                             isMuted && canUseMic ? "bg-amber-50 border-amber-200 text-amber-700" : ""}
                  disabled={isTransitioning || connectionState === "disconnected"}
                >
                  {isTransitioning ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : canUseMic ? (
                    isMuted ? <MicOff size={20} /> : <Mic size={20} />
                  ) : (
                    <Hand size={20} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isTransitioning 
                  ? getConnectionStatusText()
                  : canUseMic 
                    ? isMuted ? "Unmute" : "Mute"
                    : isHandRaised ? "Lower hand" : "Raise hand"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {isTransitioning && (
            <span className="text-xs text-muted-foreground">
              {getConnectionStatusText()}
            </span>
          )}
        </div>
        
        {/* Center controls - room widgets */}
        <div className="hidden md:block">
          <Tabs defaultValue={isChatOpen ? "chat" : "participants"} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="chat" 
                onClick={onToggleChat}
                className={!isChatOpen ? "text-muted-foreground" : ""}
              >
                <MessageSquare size={16} className="mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="participants" 
                onClick={onToggleParticipants}
                className={!isParticipantsOpen ? "text-muted-foreground" : ""}
              >
                <Users size={16} className="mr-2" />
                Participants
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Mobile tab buttons */}
        <div className="flex md:hidden gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleChat}
            className={isChatOpen ? "bg-primary/20 text-primary border-primary/20" : ""}
          >
            <MessageSquare size={16} className="mr-1" />
            Chat
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleParticipants}
            className={isParticipantsOpen ? "bg-primary/20 text-primary border-primary/20" : ""}
          >
            <Users size={16} className="mr-1" />
            People
          </Button>
        </div>
        
        {/* Right side controls - secondary actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                  onClick={onLeaveRoom}
                  disabled={isTransitioning}
                >
                  {isTransitioning ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <LogOut size={20} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isTransitioning ? getConnectionStatusText() : "Leave room"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
