
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

  // Debounced join function to prevent rapid join attempts
  const joinChannel = async (channelName: string, uid?: number) => {
    if (!client) {
      console.error("[Agora] Client not initialized");
      return;
    }
    
    // Clear any pending join requests to prevent race conditions
    clearPendingTimers();
    
    // Prevent concurrent join operations
    if (connectionStateRef.current === "connecting" || connectionStateRef.current === "disconnecting" || 
        connectionStateRef.current === "publishing" || connectionStateRef.current === "reconnecting") {
      console.log("[Agora] Already in transition state, scheduling join request");
      
      // Schedule a join attempt after a delay
      joinRequestTimerRef.current = setTimeout(() => {
        // Use ref to check the latest connection state
        if (connectionStateRef.current === "disconnected") {
          console.log("[Agora] Executing delayed join request");
          joinChannel(channelName, uid);
        } else {
          console.log("[Agora] Skipping delayed join - not in disconnected state");
        }
      }, 1000);
      
      toast({
        title: "Connection in progress",
        description: "Please wait for the current operation to complete",
      });
      return;
    }

    // If already connected to the same channel, do nothing
    if (connectionStateRef.current === "connected" && currentChannelRef.current === channelName) {
      console.log("[Agora] Already connected to this channel");
      return;
    }
    
    // If connected to a different channel, leave first
    if (connectionStateRef.current === "connected") {
      console.log("[Agora] Connected to a different channel, leaving first");
      await leaveChannel();
      
      // Wait before joining the new channel to avoid race conditions
      joinRequestTimerRef.current = setTimeout(() => {
        // Use ref to check the latest connection state
        if (connectionStateRef.current === "disconnected") {
          console.log("[Agora] Joining new channel after leaving previous one");
          joinChannel(channelName, uid);
        }
      }, 500);
      return;
    }

    // Generate random numeric uid if not provided
    const numericUid = uid || Math.floor(Math.random() * 1000000);
    
    try {
      setConnectionState("connecting");
      console.log(`[Agora] Joining channel ${channelName} with uid ${numericUid}`);
      
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
    }
  };

  return {
    joinChannel,
    joinRequestTimerRef,
    currentChannelRef
  };
}
