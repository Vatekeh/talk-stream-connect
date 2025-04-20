
/**
 * LiveKitContext and its type/interface for sharing LiveKit video/audio room state and controls.
 * Used throughout the room UI for connecting, toggling AV, tracking participants.
 */

import { createContext } from "react";
import type { Room, RemoteParticipant, LocalParticipant } from "livekit-client";

/**
 * LiveKitContextType describes shared state for LiveKit rooms and operations.
 *
 *  room - Current LiveKit Room instance (null if disconnected)
 *  isConnecting - Whether a connection is in progress
 *  isConnected - If currently in a room
 *  participants - All participants (local + remote)
 *  localParticipant - Local participant (self) object, or null if not joined
 *  remoteParticipants - Array of remote user participants
 *  joinRoom - Callable function to join a new room (by name)
 *  leaveRoom - Callable function to disconnect from room
 *  toggleMicrophone - Callable function to enable/disable local audio
 *  toggleCamera - Callable function to enable/disable local camera
 *  isMicrophoneEnabled/isCameraEnabled - User's local AV state
 */
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
