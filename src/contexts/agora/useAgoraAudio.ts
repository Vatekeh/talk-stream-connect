
import { useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { 
  IAgoraRTCClient,
  ILocalAudioTrack 
} from "agora-rtc-sdk-ng";
import { ConnectionState } from "./types";
import { toast } from "@/components/ui/use-toast";

export function useAgoraAudio(
  client: IAgoraRTCClient | null, 
  connectionStateRef: React.MutableRefObject<ConnectionState>
) {
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Refs to track state that doesn't need re-renders
  const hasJoinedRef = useRef<boolean>(false);
  const isPublishingRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const publishAttemptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;

  // Function to safely publish audio track with retry logic
  const safePublishAudioTrack = async (audioTrack: ILocalAudioTrack): Promise<void> => {
    if (!client || !hasJoinedRef.current || isPublishingRef.current) {
      console.warn("[Agora] Cannot publish: client not ready, not joined, or already publishing");
      return;
    }
    
    // Additional safety check to ensure we're still in connected state
    if (connectionStateRef.current !== "connected") {
      console.warn("[Agora] Skipping publish – state changed to", connectionStateRef.current);
      audioTrack.close();
      return;
    }

    try {
      // Set publishing state to prevent concurrent publish attempts
      isPublishingRef.current = true;
      
      console.log("[Agora] Publishing local audio track");
      await client.publish(audioTrack);
      
      console.log("[Agora] Audio track published successfully");
      setLocalAudioTrack(audioTrack);
    } catch (error: any) {
      console.error("[Agora] Error publishing audio track:", error);
      
      // Handle the PeerConnection disconnected error specifically
      if (error.message && error.message.includes("PeerConnection already disconnected")) {
        console.warn("[Agora] PeerConnection already disconnected, cleaning up");
        
        // Close the track that failed to publish
        audioTrack.close();
        
        // Reset state to attempt recovery
        if (retryCountRef.current < maxRetries && hasJoinedRef.current) {
          retryCountRef.current++;
          console.log(`[Agora] Retry attempt ${retryCountRef.current}/${maxRetries}`);
          
          // Wait before retrying
          if (publishAttemptTimerRef.current) {
            clearTimeout(publishAttemptTimerRef.current);
          }
          
          publishAttemptTimerRef.current = setTimeout(async () => {
            // Check if we're still in a valid state for retrying
            if (hasJoinedRef.current && 
               (connectionStateRef.current === "connected" || 
                connectionStateRef.current === "connecting" || 
                connectionStateRef.current === "publishing" || 
                connectionStateRef.current === "reconnecting")) {
              console.log("[Agora] Retrying audio track creation and publish");
              try {
                const newAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                await safePublishAudioTrack(newAudioTrack);
              } catch (retryError) {
                console.error("[Agora] Retry failed:", retryError);
              }
            }
          }, 1000 * retryCountRef.current); // Exponential backoff
        } else {
          // Max retries exceeded or not joined anymore
          console.warn("[Agora] Max retries exceeded or no longer joined");
        }
      }
    } finally {
      isPublishingRef.current = false;
    }
  };

  const toggleMute = async () => {
    if (!localAudioTrack) return;
    
    try {
      if (isMuted) {
        await localAudioTrack.setEnabled(true);
        setIsMuted(false);
        toast({
          title: "Microphone unmuted",
          description: "Others can hear you now",
        });
      } else {
        await localAudioTrack.setEnabled(false);
        setIsMuted(true);
        toast({
          title: "Microphone muted",
          description: "Others cannot hear you",
        });
      }
    } catch (error) {
      console.error("[Agora] Error toggling mute:", error);
      toast({
        title: "Error",
        description: "Could not change microphone state",
        variant: "destructive",
      });
    }
  };

  // Cleanup function for audio resources
  const cleanupAudio = () => {
    if (publishAttemptTimerRef.current) {
      clearTimeout(publishAttemptTimerRef.current);
      publishAttemptTimerRef.current = null;
    }
    
    if (localAudioTrack) {
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
    
    retryCountRef.current = 0;
    isPublishingRef.current = false;
  };

  return {
    localAudioTrack,
    setLocalAudioTrack,
    isMuted,
    setIsMuted,
    safePublishAudioTrack,
    toggleMute,
    cleanupAudio,
    hasJoinedRef,
    isPublishingRef,
    publishAttemptTimerRef
  };
}
