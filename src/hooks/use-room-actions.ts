import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { useAgora } from "@/contexts/AgoraContext";
import { removeParticipant } from "@/components/room/participant-utils";

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
      
      // First, remove the user from any other rooms they might be in
      const { error: removeError } = await supabase
        .from('room_participants')
        .delete()
        .eq('user_id', user.id)
        .neq('room_id', roomId);
        
      if (removeError) {
        console.error("[RoomActions] Error removing user from other rooms:", removeError);
        // Continue with join process even if this fails
      }
      
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
      
      // Check if user is the creator of the room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('creator_id')
        .eq('id', roomId)
        .single();
        
      if (roomError) {
        console.error("[RoomActions] Error checking room creator:", roomError);
        throw roomError;
      }
      
      const isCreator = roomData.creator_id === user.id;
      
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
            is_muted: true,
            is_creator: isCreator
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
  
  // Function to transfer room ownership if creator is leaving
  const transferRoomOwnership = async (userId: string, roomId: string) => {
    try {
      console.log("[RoomActions] Transferring room ownership");
      
      // Find a suitable new creator (first moderator, or oldest participant)
      const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .neq('user_id', userId)
        .order('is_moderator', { ascending: false })
        .order('joined_at', { ascending: true });
        
      if (participantsError) {
        console.error("[RoomActions] Error finding participants:", participantsError);
        return false;
      }
      
      if (!participants || participants.length === 0) {
        console.log("[RoomActions] No participants to transfer ownership to");
        return false;
      }
      
      // Select the first participant (will be a moderator if any exist)
      const newCreator = participants[0];
      
      // Update the new creator's status
      const { error: updateParticipantError } = await supabase
        .from('room_participants')
        .update({ 
          is_creator: true,
          is_moderator: true 
        })
        .eq('user_id', newCreator.user_id)
        .eq('room_id', roomId);
        
      if (updateParticipantError) {
        console.error("[RoomActions] Error updating new creator:", updateParticipantError);
        return false;
      }
      
      // Update the room's host_id
      const { error: updateRoomError } = await supabase
        .from('rooms')
        .update({ host_id: newCreator.user_id })
        .eq('id', roomId);
        
      if (updateRoomError) {
        console.error("[RoomActions] Error updating room host:", updateRoomError);
        return false;
      }
      
      console.log("[RoomActions] Room ownership transferred successfully");
      return true;
    } catch (error) {
      console.error("[RoomActions] Error transferring ownership:", error);
      return false;
    }
  };
  
  // Function to leave the room
  const leaveRoom = async () => {
    if (!roomId || !user) return;
    
    try {
      console.log("[RoomActions] Removing user from participants");
      
      // Check if user is the creator of the room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('creator_id')
        .eq('id', roomId)
        .single();
        
      if (roomError) {
        console.error("[RoomActions] Error checking room creator:", roomError);
        throw roomError;
      }
      
      // If user is the creator, try to transfer ownership
      const isCreator = roomData.creator_id === user.id;
      if (isCreator) {
        const transferred = await transferRoomOwnership(user.id, roomId);
        if (transferred) {
          toast.success("Room ownership transferred to another participant");
        }
        // Even if transfer fails, allow the creator to leave
      }
      
      // Remove user from participants using the utility function
      await removeParticipant(user.id, roomId);
      
      toast.success("You have left the room.");
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error("[RoomActions] Error leaving room:", error);
      toast.error("Could not leave the room. Please try again later.");
    }
  };
  
  // Function to toggle hand raised
  const toggleHand = async () => {
    if (!roomId || !user) return;
    
    // Don't allow toggling during transitions
    const isTransitioning = connectionState === "connecting" || 
                          connectionState === "disconnecting" || 
                          connectionState === "publishing" ||
                          connectionState === "reconnecting";
    
    if (isTransitioning) {
      toast.error("Please wait until connection is stable");
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
      toast.error("Could not update hand status. Please try again.");
    }
  };
  
  // Handle leaving the room
  const handleLeaveRoom = async () => {
    // Don't allow leaving during transitions
    const isTransitioning = connectionState === "connecting" || 
                          connectionState === "disconnecting" || 
                          connectionState === "publishing" ||
                          connectionState === "reconnecting";
    
    if (isTransitioning) {
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
