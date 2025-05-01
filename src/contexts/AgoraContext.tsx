
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ILocalAudioTrack 
} from "agora-rtc-sdk-ng";
import { toast } from "@/components/ui/use-toast";

// Define connection states for better control
type ConnectionState = "disconnected" | "connecting" | "connected" | "disconnecting";

interface AgoraContextType {
  client: IAgoraRTCClient | null;
  localAudioTrack: ILocalAudioTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  joinChannel: (channelName: string, uid?: number) => Promise<void>;
  leaveChannel: () => Promise<void>;
  toggleMute: () => Promise<void>;
  isMuted: boolean;
  connectionState: ConnectionState;
}

const AgoraContext = createContext<AgoraContextType | null>(null);

export const useAgora = () => {
  const context = useContext(AgoraContext);
  if (context === null) {
    throw new Error("useAgora must be used within an AgoraProvider");
  }
  return context;
};

interface AgoraProviderProps {
  children: ReactNode;
}

export const AgoraProvider = ({ children }: AgoraProviderProps) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  
  // Refs to track state that doesn't need re-renders
  const currentChannelRef = useRef<string | null>(null);
  const joinRequestTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRef = useRef<boolean>(false);

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);
    console.log("[Agora] Client created");

    // Set up event listeners for the client
    agoraClient.on("user-published", async (user, mediaType) => {
      console.log("[Agora] User published:", user.uid, mediaType);
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
      setRemoteUsers((prevUsers) => {
        if (prevUsers.findIndex((u) => u.uid === user.uid) === -1) {
          return [...prevUsers, user];
        }
        return prevUsers;
      });
    });

    agoraClient.on("user-unpublished", (user, mediaType) => {
      console.log("[Agora] User unpublished:", user.uid, mediaType);
      if (mediaType === "audio") {
        user.audioTrack?.stop();
      }
    });

    agoraClient.on("user-left", (user) => {
      console.log("[Agora] User left:", user.uid);
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    });

    agoraClient.on("connection-state-change", (state) => {
      console.log("[Agora] Connection state changed:", state);
      if (state === "CONNECTED") {
        setConnectionState("connected");
        hasJoinedRef.current = true;
      } else if (state === "CONNECTING") {
        setConnectionState("connecting");
      } else if (state === "DISCONNECTED" || state === "DISCONNECTING") {
        if (state === "DISCONNECTED") {
          setConnectionState("disconnected");
          hasJoinedRef.current = false;
        } else {
          setConnectionState("disconnecting");
        }
      }
    });

    return () => {
      // Clean up
      console.log("[Agora] Provider cleanup, removing listeners");
      agoraClient.removeAllListeners();
      
      // Ensure we're properly disconnected
      if (hasJoinedRef.current) {
        console.log("[Agora] Force leaving channel during cleanup");
        agoraClient.leave().catch(err => {
          console.error("[Agora] Error during cleanup leave:", err);
        });
      }
    };
  }, []);

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

  // Debounced join function to prevent rapid join attempts
  const joinChannel = async (channelName: string, uid?: number) => {
    if (!client) {
      console.error("[Agora] Client not initialized");
      return;
    }
    
    // Prevent concurrent join operations
    if (connectionState === "connecting" || connectionState === "disconnecting") {
      console.log("[Agora] Already in transition state, ignoring join request");
      toast({
        title: "Still connecting",
        description: "Please wait for the current operation to complete",
      });
      return;
    }

    // If already connected to the same channel, do nothing
    if (connectionState === "connected" && currentChannelRef.current === channelName) {
      console.log("[Agora] Already connected to this channel");
      return;
    }
    
    // If connected to a different channel, leave first
    if (connectionState === "connected") {
      console.log("[Agora] Connected to a different channel, leaving first");
      await leaveChannel();
      
      // Wait a bit before joining the new channel to avoid race conditions
      if (joinRequestTimerRef.current) {
        clearTimeout(joinRequestTimerRef.current);
      }
      
      joinRequestTimerRef.current = setTimeout(() => {
        joinChannel(channelName, uid);
      }, 300);
      return;
    }

    // Generate random numeric uid if not provided
    const numericUid = uid || Math.floor(Math.random() * 1000000);
    
    try {
      setConnectionState("connecting");
      console.log(`[Agora] Joining channel ${channelName} with uid ${numericUid}`);
      
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
      
      // Create and publish local audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish(audioTrack);
      setLocalAudioTrack(audioTrack);
      
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
    
    // Prevent leaving if not connected or already disconnecting
    if (connectionState === "disconnected") {
      console.log("[Agora] Already disconnected");
      return;
    }
    
    if (connectionState === "disconnecting") {
      console.log("[Agora] Already disconnecting");
      return;
    }
    
    try {
      console.log("[Agora] Leaving channel");
      setConnectionState("disconnecting");
      
      // Unpublish and close local tracks
      if (localAudioTrack) {
        console.log("[Agora] Unpublishing local track");
        await client.unpublish(localAudioTrack);
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      
      // Leave the channel
      if (hasJoinedRef.current) {
        console.log("[Agora] Executing leave()");
        await client.leave();
        hasJoinedRef.current = false;
      } else {
        console.log("[Agora] No need to leave, never joined");
      }
      
      // Reset state
      currentChannelRef.current = null;
      setRemoteUsers([]);
      setConnectionState("disconnected");
      
      toast({
        title: "Left room",
        description: "You've left the audio room",
      });
    } catch (error) {
      console.error("[Agora] Error leaving channel:", error);
      // Even on error, consider disconnected to reset state
      setConnectionState("disconnected");
      hasJoinedRef.current = false;
      currentChannelRef.current = null;
      
      toast({
        title: "Error",
        description: "There was an issue leaving the room, but your connection has been reset",
        variant: "destructive",
      });
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

  const value = {
    client,
    localAudioTrack,
    remoteUsers,
    joinChannel,
    leaveChannel,
    toggleMute,
    isMuted,
    connectionState,
  };

  return <AgoraContext.Provider value={value}>{children}</AgoraContext.Provider>;
};
