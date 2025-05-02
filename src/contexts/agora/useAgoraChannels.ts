
import { useRef } from "react";
import type { 
  IAgoraRTCClient,
  ILocalAudioTrack
} from "agora-rtc-sdk-ng";
import { ConnectionState } from "./types";
import { useChannelJoin } from "./useChannelJoin";
import { useChannelLeave } from "./useChannelLeave";

export function useAgoraChannels(
  client: IAgoraRTCClient | null,
  hasJoinedRef: React.MutableRefObject<boolean>,
  isPublishingRef: React.MutableRefObject<boolean>,
  connectionStateRef: React.MutableRefObject<ConnectionState>,
  safePublishAudioTrack: (audioTrack: ILocalAudioTrack) => Promise<void>,
  setConnectionState: (state: ConnectionState) => void,
  cleanupAudio: () => void
) {
  // Refs to track state that doesn't need re-renders
  const joinRequestTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any pending timers to prevent race conditions
  const clearPendingTimers = () => {
    if (joinRequestTimerRef.current) {
      clearTimeout(joinRequestTimerRef.current);
      joinRequestTimerRef.current = null;
    }
  };

  // Initialize channel leave functionality
  const { leaveChannel, retryCountRef } = useChannelLeave(
    client,
    hasJoinedRef,
    isPublishingRef,
    connectionStateRef,
    setConnectionState,
    cleanupAudio
  );

  // Initialize channel join functionality
  const { 
    joinChannel, 
    joinRequestTimerRef: joinTimerRef, 
    currentChannelRef,
    joinPromiseRef // Include the new ref
  } = useChannelJoin(
    client,
    hasJoinedRef,
    connectionStateRef,
    safePublishAudioTrack,
    setConnectionState,
    clearPendingTimers,
    leaveChannel
  );

  // Use the ref from useChannelJoin to ensure we're using the same timer reference
  joinRequestTimerRef.current = joinTimerRef.current;

  // Cleanup function for channel resources
  const cleanupChannels = () => {
    clearPendingTimers();
  };

  return {
    joinChannel,
    leaveChannel,
    cleanupChannels,
    joinRequestTimerRef,
    joinPromiseRef // Export the ref
  };
}
