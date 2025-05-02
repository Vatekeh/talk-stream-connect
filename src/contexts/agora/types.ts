
import type { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ILocalAudioTrack 
} from "agora-rtc-sdk-ng";

// Define connection states for better control
export type ConnectionState = "disconnected" | "connecting" | "connected" | "disconnecting" | "publishing" | "reconnecting";

export interface AgoraContextType {
  client: IAgoraRTCClient | null;
  localAudioTrack: ILocalAudioTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  joinChannel: (channelName: string, uid?: number) => Promise<void>;
  leaveChannel: () => Promise<void>;
  toggleMute: () => Promise<void>;
  isMuted: boolean;
  connectionState: ConnectionState;
}
