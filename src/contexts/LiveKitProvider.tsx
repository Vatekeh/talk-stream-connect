
/**
 * LiveKitProvider context for managing LiveKit video room state.
 * Handles connecting, disconnecting, toggling audio/video, and updating local state as participants change.
 * Consumes user from AuthContext for authorization when joining a room.
 *
 * All event and state changes push toast notifications for real-time feedback.
 */

import { useState, useEffect, ReactNode } from "react";
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, ConnectionState } from "livekit-client";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LiveKitContext from "./LiveKitContext";

export function LiveKitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  /**
   * Fetches a LiveKit access token from Supabase Edge Function.
   * Will throw on any auth or network failure.
   */
  const getToken = async (roomName: string): Promise<string> => {
    try {
      // Call Supabase Edge Function to get a token
      const { data, error } = await supabase.functions.invoke('get-livekit-token', {
        body: {
          room: roomName,
          userId: user?.id,
          name: user?.user_metadata?.full_name || user?.email
        }
      });

      if (error) {
        console.error("Error getting LiveKit token:", error);
        throw error;
      }

      if (!data || !data.token) {
        throw new Error("No token returned from the server");
      }

      return data.token;
    } catch (error) {
      console.error("Error getting LiveKit token:", error);
      toast.error("Failed to get access token for the room");
      throw error;
    }
  };

  /**
   * Connects to the specified LiveKit room.
   * Ensures only one connection at a time, and cleans up any prior room.
   */
  const joinRoom = async (roomName: string) => {
    if (!user) {
      toast.error("You must be logged in to join a room");
      return;
    }

    try {
      setIsConnecting(true);

      // Disconnect from existing room if any
      if (room) {
        room.disconnect();
      }

      // Create a new room instance
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      setRoom(newRoom);

      // Attach listeners for participant and connection events
      newRoom.on(RoomEvent.ParticipantConnected, () => {
        toast.info("A participant has joined the room");
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, () => {
        toast.info("A participant has left the room");
      });

      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log("Connection state changed to:", state);
        setIsConnected(state === ConnectionState.Connected);
        if (state === ConnectionState.Disconnected) {
          setIsMicrophoneEnabled(false);
          setIsCameraEnabled(false);
        }
      });

      // Get token and connect to room
      const token = await getToken(roomName);
      if (!token) {
        throw new Error("Failed to get token");
      }

      console.log("Connecting to LiveKit server...");
      await newRoom.connect(import.meta.env.VITE_LIVEKIT_URL, token);
      console.log("Connected to LiveKit server");

      setIsConnected(true);
      toast.success(`Connected to room: ${roomName}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join the room");
      setRoom(null);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnects from the active LiveKit room and resets all relevant state.
   */
  const leaveRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setIsMicrophoneEnabled(false);
      setIsCameraEnabled(false);
      toast.info("Left the room");
    }
  };

  /**
   * Enables or disables the local user's microphone and updates local state.
   * Will show toasts for both error and success.
   */
  const toggleMicrophone = async () => {
    if (!room || !room.localParticipant) {
      toast.error("Not connected to a room");
      return;
    }

    try {
      const enabled = !isMicrophoneEnabled;
      if (!isConnected) {
        toast.error("Cannot toggle microphone: not connected to room");
        return;
      }
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setIsMicrophoneEnabled(enabled);
      toast.success(enabled ? "Microphone enabled" : "Microphone disabled");
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to toggle microphone");
    }
  };

  /**
   * Enables or disables the local user's camera and updates local state.
   */
  const toggleCamera = async () => {
    if (!room || !room.localParticipant) {
      toast.error("Not connected to a room");
      return;
    }

    try {
      const enabled = !isCameraEnabled;
      if (!isConnected) {
        toast.error("Cannot toggle camera: not connected to room");
        return;
      }
      await room.localParticipant.setCameraEnabled(enabled);
      setIsCameraEnabled(enabled);
      toast.success(enabled ? "Camera enabled" : "Camera disabled");
    } catch (error) {
      console.error("Error toggling camera:", error);
      toast.error("Failed to toggle camera");
    }
  };

  // Room cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  /**
   * Value provided to context consumers in the app for shared room state and controls.
   */
  const value = {
    room,
    isConnecting,
    isConnected,
    participants: room ? [...room.participants.values(), room.localParticipant] : [],
    localParticipant: room?.localParticipant || null,
    remoteParticipants: room ? Array.from(room.participants.values()) : [],
    joinRoom,
    leaveRoom,
    toggleMicrophone,
    toggleCamera,
    isMicrophoneEnabled,
    isCameraEnabled,
  };

  return (
    <LiveKitContext.Provider value={value}>
      {children}
    </LiveKitContext.Provider>
  );
}
