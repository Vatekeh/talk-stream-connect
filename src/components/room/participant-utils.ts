
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Function to update user status (speaker/moderator)
export const updateParticipantStatus = async (userId: string, updates: any) => {
  try {
    // First check if the user has a profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error checking user profile:", profileError);
      throw profileError;
    }
      
    // Create profile if it doesn't exist
    if (!profileData) {
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          // Use a default username for now
          username: 'Anonymous'
        });
          
      if (createProfileError) {
        console.error("Error creating user profile:", createProfileError);
        throw createProfileError;
      }
    }
    
    // Now update the participant status
    const { error } = await supabase
      .from('room_participants')
      .update(updates)
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error updating participant status:", error);
      throw error;
    }
    
    const action = updates.is_speaker !== undefined 
      ? (updates.is_speaker ? "promoted to speaker" : "removed as speaker")
      : (updates.is_moderator ? "promoted to moderator" : "removed as moderator");
    
    toast({
      description: `User has been ${action}.`,
    });
  } catch (error) {
    console.error("Error updating participant status:", error);
    toast({
      variant: "destructive",
      description: "Failed to update user status.",
    });
  }
};

// Function to remove participant from room - Now properly uses roomId parameter
export const removeParticipant = async (userId: string, roomId: string) => {
  try {
    console.log(`Removing participant ${userId} from room ${roomId}`);
    
    // Delete the participant with both user_id and room_id filters
    const { data, error } = await supabase
      .from('room_participants')
      .delete()
      .eq('user_id', userId)
      .eq('room_id', roomId)
      .select(); // Return the deleted row
      
    if (error) {
      console.error("Error removing participant:", error);
      throw error;
    }
    
    console.log("Removed participant data:", data);
    
    toast({
      description: "User has been removed from the room.",
    });
    
    return data;
  } catch (error) {
    console.error("Error removing participant:", error);
    toast({
      variant: "destructive",
      description: "Failed to remove user from room.",
    });
    throw error;
  }
};

// New function to kick a participant from a room (must be performed by a moderator)
export const kickParticipant = async (roomId: string, targetUserId: string, byUserId: string) => {
  try {
    // First verify that the user performing the kick is a moderator or creator
    const { data: moderatorData, error: moderatorError } = await supabase
      .from('room_participants')
      .select('is_moderator, is_creator')
      .eq('user_id', byUserId)
      .eq('room_id', roomId)
      .single();
      
    if (moderatorError) {
      console.error("Error checking moderator status:", moderatorError);
      throw moderatorError;
    }
    
    // Only allow kick if user is moderator or creator
    if (!moderatorData || (!moderatorData.is_moderator && !moderatorData.is_creator)) {
      toast({
        variant: "destructive",
        description: "You don't have permission to kick participants.",
      });
      return null;
    }
    
    // Now remove the targeted participant
    const result = await removeParticipant(targetUserId, roomId);
    
    toast({
      description: "User has been kicked from the room.",
    });
    
    return result;
  } catch (error) {
    console.error("Error kicking participant:", error);
    toast({
      variant: "destructive",
      description: "Failed to kick user from room.",
    });
    throw error;
  }
};

// Helper function to get user initials
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
};
