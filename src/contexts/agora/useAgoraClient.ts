import { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser
} from "agora-rtc-sdk-ng";
import { ConnectionState } from "./types";

export function useAgoraClient() {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const connectionStateRef = useRef<ConnectionState>("disconnected");
  
  // Keep the ref synchronized with the state
  useEffect(() => {
    connectionStateRef.current = connectionState;
  }, [connectionState]);

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
      } else if (state === "CONNECTING") {
        setConnectionState("connecting");
      } else if (state === "RECONNECTING") {
        setConnectionState("reconnecting");
      } else if (state === "DISCONNECTED" || state === "DISCONNECTING") {
        if (state === "DISCONNECTED") {
          setConnectionState("disconnected");
        } else {
          setConnectionState("disconnecting");
        }
      }
    });

    return () => {
      // Clean up
      console.log("[Agora] Provider cleanup, removing listeners");
      agoraClient.removeAllListeners();
    };
  }, []);

  return {
    client,
    remoteUsers,
    connectionState,
    setConnectionState,
    connectionStateRef
  };
}
