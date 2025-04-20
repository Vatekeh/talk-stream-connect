
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, RemoteTrackPublication, ConnectionState } from "livekit-client";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LiveKitContextType {
  room: Room | null;
  isConnecting: boolean;
  isConnected: boolean;
  participants: (LocalParticipant | RemoteParticipant)[];
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  joinRoom: (roomName: string) => Promise<void>;
  leaveRoom: () => void;
  toggleMicrophone: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
}

const LiveKitContext = createContext<LiveKitContextType | undefined>(undefined);

export function LiveKitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  
  // Function to get a token from the server
  const getToken = async (roomName: string): Promise<string> => {
    try {
      // Call Supabase Edge Function to get a token
      const { data, error } = await supabase.functions.invoke('get-livekit-token', {
        body: { room: roomName, userId: user?.id }
      });
      
      if (error) throw error;
      return data.token;
    } catch (error) {
      console.error("Error getting LiveKit token:", error);
      toast.error("Failed to get access token for the room");
      throw error;
    }
  };

  const joinRoom = async (roomName: string) => {
    if (!user) {
      toast.error("You must be logged in to join a room");
      return;
    }

    try {
      setIsConnecting(true);
      
      // Create a new room if it doesn't exist
      if (!room) {
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        setRoom(newRoom);

        // Set up event listeners
        newRoom.on(RoomEvent.ParticipantConnected, () => {
          toast.info("A participant has joined the room");
        });
        
        newRoom.on(RoomEvent.ParticipantDisconnected, () => {
          toast.info("A participant has left the room");
        });
        
        newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
          setIsConnected(state === ConnectionState.Connected);
          if (state === ConnectionState.Disconnected) {
            setIsMicrophoneEnabled(false);
            setIsCameraEnabled(false);
          }
        });
        
        // Get token and connect to room
        const token = await getToken(roomName);
        await newRoom.connect(import.meta.env.VITE_LIVEKIT_URL, token);
        
        setIsConnected(true);
        toast.success(`Connected to room: ${roomName}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join the room");
    } finally {
      setIsConnecting(false);
    }
  };

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

  const toggleMicrophone = async () => {
    if (!room || !room.localParticipant) return;
    
    try {
      const enabled = !isMicrophoneEnabled;
      if (enabled) {
        // Use createLocalAudioTrack instead of enableMicrophone
        await room.localParticipant.setMicrophoneEnabled(true);
      } else {
        // Use disableLocalTrack instead of disableMicrophone
        await room.localParticipant.setMicrophoneEnabled(false);
      }
      setIsMicrophoneEnabled(enabled);
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to toggle microphone");
    }
  };

  const toggleCamera = async () => {
    if (!room || !room.localParticipant) return;
    
    try {
      const enabled = !isCameraEnabled;
      if (enabled) {
        // Use createLocalVideoTrack instead of enableCamera
        await room.localParticipant.setCameraEnabled(true);
      } else {
        // Use disableLocalTrack instead of disableCamera
        await room.localParticipant.setCameraEnabled(false);
      }
      setIsCameraEnabled(enabled);
    } catch (error) {
      console.error("Error toggling camera:", error);
      toast.error("Failed to toggle camera");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

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

export function useLiveKit() {
  const context = useContext(LiveKitContext);
  if (context === undefined) {
    throw new Error("useLiveKit must be used within a LiveKitProvider");
  }
  return context;
}
