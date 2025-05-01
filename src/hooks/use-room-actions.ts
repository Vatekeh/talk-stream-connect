
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { useAgora } from "@/contexts/AgoraContext";

export function useRoomActions(roomId: string | undefined, user: any | null, currentUserParticipant: User | null) {
  const [isHandRaised, setIsHandRaised] = useState(currentUserParticipant?.isHandRaised || false);
  const navigate = useNavigate();
  const { connectionState, leaveChannel } = useAgora();

  // Sync hand raised status from participant data
  useEffect(() => {
    if (currentUserParticipant) {
      setIsHandRaised(currentUserParticipant.isHandRaised || false);
    }
  }, [currentUserParticipant]);

  // Function to join the room
  const joinRoom = async () => {
    if (!roomId || !user) return;
    
    try {
      console.log("[RoomActions] Checking if user is in room");
      // Check if user is already in the room
      const { data, error: checkError } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("[RoomActions] Error checking room participation:", checkError);
        throw checkError;
      }
      
      // If not already in the room, add them
      if (!data) {
        console.log("[RoomActions] User not in room, joining");
        // First check if the user has a profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("[RoomActions] Error checking user profile:", profileError);
          throw profileError;
        }
          
        // Create profile if it doesn't exist
        if (!profileData) {
          console.log("[RoomActions] Creating user profile");
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'
            });
              
          if (createProfileError) {
            console.error("[RoomActions] Error creating user profile:", createProfileError);
            throw createProfileError;
          }
        }
          
        // Now join the room
        console.log("[RoomActions] Joining room in database");
        const { error } = await supabase
          .from('room_participants')
          .insert({
            room_id: roomId,
            user_id: user.id,
            is_speaker: false,
            is_moderator: false,
            is_muted: true
          });
            
        if (error) {
          console.error("[RoomActions] Error joining room:", error);
          throw error;
        }
          
        toast.success("You have joined the room as a listener.");
      } else {
        console.log("[RoomActions] User already in room");
      }
    } catch (error) {
      console.error("[RoomActions] Error joining room:", error);
      toast.error("Could not join the room. Please try again later.");
    }
  };
  
  // Function to leave the room
  const leaveRoom = async () => {
    if (!roomId || !user) return;
    
    try {
      console.log("[RoomActions] Removing user from participants");
      // Remove user from participants
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success("You have left the room.");
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error("[RoomActions] Error leaving room:", error);
    }
  };
  
  // Function to toggle hand raised
  const toggleHand = async () => {
    if (!roomId || !user) return;
    
    // Don't allow toggling during transitions
    if (connectionState === "connecting" || connectionState === "disconnecting") {
      toast.error("Please wait until you are fully connected");
      return;
    }
    
    try {
      const newHandRaised = !isHandRaised;
      console.log(`[RoomActions] ${newHandRaised ? 'Raising' : 'Lowering'} hand`);
      
      // Update hand raised status
      const { error } = await supabase
        .from('room_participants')
        .update({ is_hand_raised: newHandRaised })
        .eq('room_id', roomId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setIsHandRaised(newHandRaised);
      
      toast.success(newHandRaised ? "Hand raised" : "Hand lowered");
    } catch (error) {
      console.error("[RoomActions] Error toggling hand:", error);
    }
  };
  
  // Handle leaving the room
  const handleLeaveRoom = async () => {
    // Don't allow leaving during transitions
    if (connectionState === "connecting" || connectionState === "disconnecting") {
      toast.error("Please wait until the current operation completes");
      return;
    }
    
    console.log("[RoomActions] Leaving room and audio channel");
    await leaveChannel();
    await leaveRoom();
  };

  return {
    isHandRaised,
    setIsHandRaised,
    joinRoom,
    leaveRoom,
    toggleHand,
    handleLeaveRoom
  };
}
