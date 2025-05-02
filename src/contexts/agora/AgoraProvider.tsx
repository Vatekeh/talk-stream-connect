
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useAgoraClient } from "./useAgoraClient";
import { useAgoraAudio } from "./useAgoraAudio";
import { useAgoraChannels } from "./useAgoraChannels";
import { AgoraContextType } from "./types";

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
  // Initialize the client and connection state
  const {
    client,
    remoteUsers,
    connectionState,
    setConnectionState,
    connectionStateRef
  } = useAgoraClient();
  
  // Initialize audio handling
  const {
    localAudioTrack,
    isMuted,
    safePublishAudioTrack,
    toggleMute,
    cleanupAudio,
    hasJoinedRef,
    isPublishingRef,
    publishAttemptTimerRef
  } = useAgoraAudio(client, connectionStateRef);
  
  // Initialize channel management
  const {
    joinChannel,
    leaveChannel,
    cleanupChannels,
    joinRequestTimerRef
  } = useAgoraChannels(
    client,
    hasJoinedRef,
    isPublishingRef,
    connectionStateRef,
    safePublishAudioTrack,
    setConnectionState,
    cleanupAudio
  );
  
  // Setup cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("[Agora] Provider cleanup");
      
      // Clean up timers
      if (joinRequestTimerRef.current) {
        clearTimeout(joinRequestTimerRef.current);
      }
      if (publishAttemptTimerRef.current) {
        clearTimeout(publishAttemptTimerRef.current);
      }
      
      // Clean up audio resources
      cleanupAudio();
      
      // Clean up channel resources
      cleanupChannels();
      
      // Ensure we're properly disconnected
      if (hasJoinedRef.current && client) {
        console.log("[Agora] Force leaving channel during cleanup");
        client.leave().catch(err => {
          console.error("[Agora] Error during cleanup leave:", err);
        });
        hasJoinedRef.current = false;
        isPublishingRef.current = false;
      }
    };
  }, []);

  const value: AgoraContextType = {
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
