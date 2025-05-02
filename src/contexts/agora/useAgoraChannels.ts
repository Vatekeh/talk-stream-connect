
import { useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { 
  IAgoraRTCClient
} from "agora-rtc-sdk-ng";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ConnectionState } from "./types";

export function useAgoraChannels(
  client: IAgoraRTCClient | null,
  hasJoinedRef: React.RefObject<boolean>,
  isPublishingRef: React.RefObject<boolean>,
  connectionStateRef: React.RefObject<ConnectionState>,
  safePublishAudioTrack: (audioTrack: any) => Promise<void>,
  setConnectionState: (state: ConnectionState) => void,
  cleanupAudio: () => void
) {
  // Refs to track state that doesn't need re-renders
  const currentChannelRef = useRef<string | null>(null);
  const joinRequestTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  
  // Function to get an Agora token from the edge function
  const getAgoraToken = async (channelName: string, uid: number) => {
    try {
      console.log(`[Agora] Getting token for channel ${channelName}, uid ${uid}`);
      const { data, error } = await supabase.functions.invoke("get-agora-token", {
        body: { channel: channelName, uid: uid.toString(), role: "publisher" },
      });

      if (error) throw error;
      console.log("[Agora] Token received");
      return data.token;
    } catch (error) {
      console.error("[Agora] Error getting token:", error);
      throw error;
    }
  };

  // Clear any pending timers to prevent race conditions
  const clearPendingTimers = () => {
    if (joinRequestTimerRef.current) {
      clearTimeout(joinRequestTimerRef.current);
      joinRequestTimerRef.current = null;
    }
  };

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
      
      // Reset state
      retryCountRef.current = 0;
      
      // Get Agora token
      const token = await getAgoraToken(channelName, numericUid);
      
      // Get Agora App ID from environment or stored configuration
      const { data, error } = await supabase.functions.invoke("get-agora-appid", {
        body: {}
      });
      
      if (error || !data?.appId) {
        throw new Error("Failed to retrieve Agora App ID");
      }
      
      // Join the channel
      await client.join(data.appId, channelName, token, numericUid);
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

  const leaveChannel = async () => {
    if (!client) {
      console.log("[Agora] No client to leave channel");
      return;
    }
    
    // Clear any pending timers to prevent race conditions
    clearPendingTimers();
    
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
      currentChannelRef.current = null;
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
      currentChannelRef.current = null;
      setConnectionState("disconnected");
      
      toast({
        title: "Error",
        description: "There was an issue leaving the room, but your connection has been reset",
        variant: "destructive",
      });
    }
  };

  // Cleanup function for channel resources
  const cleanupChannels = () => {
    clearPendingTimers();
  };

  return {
    joinChannel,
    leaveChannel,
    cleanupChannels,
    joinRequestTimerRef
  };
}
