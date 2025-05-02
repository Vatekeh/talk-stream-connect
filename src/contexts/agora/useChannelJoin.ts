
import { useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { 
  IAgoraRTCClient,
  ILocalAudioTrack
} from "agora-rtc-sdk-ng";
import { toast } from "@/components/ui/use-toast";
import { ConnectionState } from "./types";
import { getAgoraToken, getAgoraAppId } from "./utils/tokenService";

export function useChannelJoin(
  client: IAgoraRTCClient | null,
  hasJoinedRef: React.MutableRefObject<boolean>,
  connectionStateRef: React.MutableRefObject<ConnectionState>,
  safePublishAudioTrack: (audioTrack: ILocalAudioTrack) => Promise<void>,
  setConnectionState: (state: ConnectionState) => void,
  clearPendingTimers: () => void,
  leaveChannel: () => Promise<void>
) {
  // Ref to track state that doesn't need re-renders
  const currentChannelRef = useRef<string | null>(null);
  const joinRequestTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Add join promise ref for atomic join operation
  const joinPromiseRef = useRef<Promise<void> | null>(null);

  // Debounced join function to prevent rapid join attempts
  const joinChannel = async (channelName: string, uid?: number) => {
    if (!client) {
      console.error("[Agora] Client not initialized");
      return;
    }
    
    // Short-circuit if already joining/connected to same channel
    if (currentChannelRef.current === channelName &&
        (connectionStateRef.current === "connecting" ||
         connectionStateRef.current === "connected")) {
      console.log("[Agora] Join suppressed – already joining/connected to", channelName);
      return;
    }
    
    // If a previous join is still pending, await it then check again
    if (joinPromiseRef.current) {
      await joinPromiseRef.current.catch(() => {}); // swallow previous error
      // Re-check state after waiting for previous join
      if (connectionStateRef.current !== "disconnected") {
        console.log("[Agora] Join skipped – previous join completed and state is", connectionStateRef.current);
        return;
      }
    }
    
    // Clear any pending join requests to prevent race conditions
    clearPendingTimers();
    
    // Create atomic join promise
    joinPromiseRef.current = (async () => {
      try {
        setConnectionState("connecting");
        console.log(`[Agora] Joining channel ${channelName} with uid ${uid || 'random'}`);
        
        // Generate random numeric uid if not provided
        const numericUid = uid || Math.floor(Math.random() * 1000000);
        
        // Get Agora token
        const token = await getAgoraToken(channelName, numericUid);
        
        // Get Agora App ID
        const appId = await getAgoraAppId();
        
        // Join the channel
        await client.join(appId, channelName, token, numericUid);
        console.log(`[Agora] Successfully joined channel ${channelName}`);
        
        // Store current channel
        currentChannelRef.current = channelName;
        hasJoinedRef.current = true;
        
        // Ensure we're in a stable state before continuing
        setConnectionState("connected");
        
        // Wait a moment before trying to publish to ensure the connection is stable
        setTimeout(async () => {
          // Use ref to check the latest connection state
          if (hasJoinedRef.current && connectionStateRef.current === "connected") {
            try {
              // Create and publish local audio track
              const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
              await safePublishAudioTrack(audioTrack);
            } catch (publishError) {
              console.error("[Agora] Error during delayed publish:", publishError);
            }
          }
        }, 300);
        
        toast({
          title: "Joined room",
          description: `You joined ${channelName} successfully`,
        });
      } catch (error) {
        console.error("[Agora] Error joining channel:", error);
        setConnectionState("disconnected");
        hasJoinedRef.current = false;
        currentChannelRef.current = null;
        
        toast({
          title: "Failed to join room",
          description: "There was an error connecting to the audio room",
          variant: "destructive",
        });
        throw error; // Re-throw for promise chain
      }
    })();
    
    // Wait for the join to complete and clear the promise ref
    await joinPromiseRef.current.finally(() => {
      joinPromiseRef.current = null;
    });
  };

  return {
    joinChannel,
    joinRequestTimerRef,
    currentChannelRef,
    joinPromiseRef // Export the ref
  };
}
