
import { Button } from "@/components/ui/button";
import { Share2, LogOut, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConnectionState } from "@/contexts/agora/types";
import { getConnectionStatusText } from "./connection-status";

interface SecondaryControlsProps {
  isTransitioning: boolean;
  connectionState: ConnectionState;
  onLeaveRoom: () => void;
  onShareRoom: () => void;
}

export function SecondaryControls({
  isTransitioning,
  connectionState,
  onLeaveRoom,
  onShareRoom
}: SecondaryControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onShareRoom}>
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
            {isTransitioning ? getConnectionStatusText(connectionState) : "Leave room"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
