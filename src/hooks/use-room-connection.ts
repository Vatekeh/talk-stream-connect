
import { useState, useEffect, useRef } from "react";
import { ConnectionState } from "@/contexts/agora/types";
import { useAgora } from "@/contexts/AgoraContext";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to manage room audio connection state
 */
export function useRoomConnection(roomId: string | undefined, user: any, currentUserParticipant: User | null | undefined) {
  // Agora context for audio functionality
  const { joinChannel, leaveChannel, remoteUsers, isMuted, toggleMute, connectionState } = useAgora();
  
  // Join Agora channel when component mounts and room data is available
  useEffect(() => {
    if (!roomId) return;
    
    console.log("[Room] Initiating Agora join for", roomId);
    // Using numeric uid for better stability
    const numericUid = user?.id ? parseInt(user.id.replace(/-/g, "").substring(0, 6), 16) : undefined;
    joinChannel(roomId, numericUid);
    
    return () => {
      console.log("[Room] Cleanup for", roomId);
      leaveChannel();
    };
  }, [roomId, user?.id]); // Only depend on the stable ID values
  
  // Update mute status when Agora mute changes - in separate effect
  useEffect(() => {
    if (roomId && user && currentUserParticipant?.isSpeaker) {
      const updateMuteStatus = async () => {
        const { error } = await supabase
          .from('room_participants')
          .update({ is_muted: isMuted })
          .eq('room_id', roomId)
          .eq('user_id', user.id);
          
        if (error) {
          console.error("[RoomPage] Error updating mute status:", error);
        }
      };
      
      updateMuteStatus();
    }
  }, [isMuted, roomId, user, currentUserParticipant]);
  
  // Show connecting indicator when appropriate
  const isTransitioning = connectionState === "connecting" || 
                         connectionState === "disconnecting" || 
                         connectionState === "publishing" ||
                         connectionState === "reconnecting";
  
  // Return values needed by components
  return {
    remoteUsers,
    isMuted,
    toggleMute,
    connectionState,
    isTransitioning
  };
}
