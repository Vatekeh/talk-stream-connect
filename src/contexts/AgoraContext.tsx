
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ILocalAudioTrack 
} from "agora-rtc-sdk-ng";
import { toast } from "@/components/ui/use-toast";

interface AgoraContextType {
  client: IAgoraRTCClient | null;
  localAudioTrack: ILocalAudioTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  joinChannel: (channelName: string, uid?: string) => Promise<void>;
  leaveChannel: () => Promise<void>;
  toggleMute: () => Promise<void>;
  isMuted: boolean;
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

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);

    // Set up event listeners for the client
    agoraClient.on("user-published", async (user, mediaType) => {
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
      if (mediaType === "audio") {
        user.audioTrack?.stop();
      }
    });

    agoraClient.on("user-left", (user) => {
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    });

    return () => {
      // Clean up
      agoraClient.removeAllListeners();
    };
  }, []);

  // Function to get an Agora token from the edge function
  const getAgoraToken = async (channelName: string, uid: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("get-agora-token", {
        body: { channel: channelName, uid, role: "publisher" },
      });

      if (error) throw error;
      return data.token;
    } catch (error) {
      console.error("Error getting Agora token:", error);
      throw error;
    }
  };

  const joinChannel = async (channelName: string, uid = String(Math.floor(Math.random() * 1000000))) => {
    if (!client) return;
    
    try {
      // Get Agora token
      const token = await getAgoraToken(channelName, uid);
      
      // Get Agora App ID from environment or stored configuration
      const appId = await supabase.functions.invoke("get-agora-appid", {
        body: {}
      }).then(res => res.data?.appId);
      
      if (!appId) {
        throw new Error("Failed to retrieve Agora App ID");
      }
      
      // Join the channel
      await client.join(appId, channelName, token, uid);
      
      // Create and publish local audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish(audioTrack);
      setLocalAudioTrack(audioTrack);
      
      toast({
        title: "Joined room",
        description: `You joined ${channelName} successfully`,
      });
    } catch (error) {
      console.error("Error joining channel:", error);
      toast({
        title: "Failed to join room",
        description: "There was an error connecting to the audio room",
        variant: "destructive",
      });
    }
  };

  const leaveChannel = async () => {
    if (!client) return;
    
    // Unpublish and close local tracks
    if (localAudioTrack) {
      await client.unpublish(localAudioTrack);
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
    
    // Leave the channel
    await client.leave();
    setRemoteUsers([]);
    
    toast({
      title: "Left room",
      description: "You've left the audio room",
    });
  };

  const toggleMute = async () => {
    if (!localAudioTrack) return;
    
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
  };

  const value = {
    client,
    localAudioTrack,
    remoteUsers,
    joinChannel,
    leaveChannel,
    toggleMute,
    isMuted,
  };

  return <AgoraContext.Provider value={value}>{children}</AgoraContext.Provider>;
};
