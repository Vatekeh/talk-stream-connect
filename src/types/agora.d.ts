
declare module 'agora-rtc-sdk-ng' {
  export interface ClientConfig {
    mode: string;
    codec: string;
  }
  
  export interface IAgoraRTCRemoteUser {
    uid: string | number;
    audioTrack?: IRemoteAudioTrack;
  }
  
  export interface IRemoteAudioTrack {
    play(): void;
    stop(): void;
  }
  
  export interface ILocalAudioTrack {
    setEnabled(enabled: boolean): Promise<void>;
    close(): void;
  }
  
  export interface ILocalTrack {
    setEnabled(enabled: boolean): Promise<void>;
    close(): void;
  }
  
  export interface IAgoraRTCClient {
    join(appId: string, channel: string, token: string | null, uid?: string | number): Promise<string | number>;
    leave(): Promise<void>;
    publish(track: ILocalTrack): Promise<void>;
    unpublish(track: ILocalTrack): Promise<void>;
    subscribe(user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video'): Promise<void>;
    on(event: string, callback: Function): void;
    removeAllListeners(): void;
  }
  
  const AgoraRTC: {
    createClient(config: ClientConfig): IAgoraRTCClient;
    createMicrophoneAudioTrack(): Promise<ILocalAudioTrack>;
  };
  
  export default AgoraRTC;
}
