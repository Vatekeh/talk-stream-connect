
import { useRef } from "react";
import type { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { toast } from "@/components/ui/use-toast";
import { ConnectionState } from "./types";

export function useChannelLeave(
  client: IAgoraRTCClient | null,
  hasJoinedRef: React.MutableRefObject<boolean>,
  isPublishingRef: React.MutableRefObject<boolean>,
  connectionStateRef: React.MutableRefObject<ConnectionState>,
  setConnectionState: (state: ConnectionState) => void,
  cleanupAudio: () => void
) {
  // Reference to the current channel
  const retryCountRef = useRef<number>(0);

  const leaveChannel = async () => {
    if (!client) {
      console.log("[Agora] No client to leave channel");
      return;
    }
    
    // Prevent leaving if not connected or already disconnecting
    if (connectionStateRef.current === "disconnected") {
      console.log("[Agora] Already disconnected");
      return;
    }
    
    if (connectionStateRef.current === "disconnecting") {
      console.log("[Agora] Already disconnecting");
      return;
    }
    
    try {
      console.log("[Agora] Leaving channel");
      setConnectionState("disconnecting");
      
      // Clean up audio resources
      cleanupAudio();
      
      // Leave the channel
      if (hasJoinedRef.current) {
        console.log("[Agora] Executing leave()");
        try {
          await client.leave();
          console.log("[Agora] Left channel successfully");
        } catch (leaveError) {
          console.error("[Agora] Error leaving channel:", leaveError);
          // Force the state update even if leave fails
        }
      } else {
        console.log("[Agora] No need to leave, never joined");
      }
      
      // Reset state
      hasJoinedRef.current = false;
      isPublishingRef.current = false;
      setConnectionState("disconnected");
      
      toast({
        title: "Left room",
        description: "You've left the audio room",
      });
    } catch (error) {
      console.error("[Agora] Error leaving channel:", error);
      // Even on error, consider disconnected to reset state
      hasJoinedRef.current = false;
      isPublishingRef.current = false;
      setConnectionState("disconnected");
      
      toast({
        title: "Error",
        description: "There was an issue leaving the room, but your connection has been reset",
        variant: "destructive",
      });
    }
  };

  return {
    leaveChannel,
    retryCountRef
  };
}
