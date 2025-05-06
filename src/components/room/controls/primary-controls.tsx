
import { Button } from "@/components/ui/button";
import { Hand, Mic, MicOff, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConnectionState } from "@/contexts/agora/types";
import { getConnectionStatusText } from "./connection-status";

interface PrimaryControlsProps {
  canUseMic: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  isTransitioning: boolean;
  connectionState: ConnectionState;
  onToggleMute: () => Promise<void>;
  onToggleHand: () => void;
}

export function PrimaryControls({
  canUseMic,
  isMuted,
  isHandRaised,
  isTransitioning,
  connectionState,
  onToggleMute,
  onToggleHand
}: PrimaryControlsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={canUseMic ? "outline" : "default"}
            size="icon" 
            onClick={canUseMic ? onToggleMute : onToggleHand}
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
            ? getConnectionStatusText(connectionState)
            : canUseMic 
              ? isMuted ? "Unmute" : "Mute"
              : isHandRaised ? "Lower hand" : "Raise hand"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
