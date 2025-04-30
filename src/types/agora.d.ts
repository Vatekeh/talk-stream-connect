
declare module 'agora-rtc-sdk-ng' {
  export interface IAgoraRTCClient {
    join(appId: string, channel: string, token: string | null, uid?: string | number): Promise<string | number>;
    leave(): Promise<void>;
    publish(track: ILocalTrack): Promise<void>;
    unpublish(track: ILocalTrack): Promise<void>;
    subscribe(user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video'): Promise<void>;
    on(event: string, callback: Function): void;
    removeAllListeners(): void;
  }

  export interface ILocalAudioTrack extends ILocalTrack {
    setEnabled(enabled: boolean): Promise<void>;
    close(): void;
  }

  export interface ILocalTrack {
    setEnabled(enabled: boolean): Promise<void>;
    close(): void;
  }

  export interface IAgoraRTCRemoteUser {
    uid: string | number;
    audioTrack?: IRemoteAudioTrack;
  }

  export interface IRemoteAudioTrack {
    play(): void;
    stop(): void;
  }

  export interface ClientConfig {
    mode: string;
    codec: string;
  }

  export function createClient(config: ClientConfig): IAgoraRTCClient;
  export function createMicrophoneAudioTrack(): Promise<ILocalAudioTrack>;
}

declare module 'agora-rtc-react' {
  import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
  import { ReactNode } from 'react';
  
  export interface AgoraRTCProviderProps {
    client: IAgoraRTCClient;
    children: ReactNode;
  }
  
  export function AgoraRTCProvider(props: AgoraRTCProviderProps): JSX.Element;
}
