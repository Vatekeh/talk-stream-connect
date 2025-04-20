
import { createContext } from "react";
import type { Room, RemoteParticipant, LocalParticipant } from "livekit-client";

export interface LiveKitContextType {
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

export default LiveKitContext;
