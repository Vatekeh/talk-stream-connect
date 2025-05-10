
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a user profile in the database if it doesn't exist
 * Called after authentication to ensure all users have a profile
 */
export const createProfileIfNeeded = async (user: User) => {
  try {
    // Check if profile exists
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error checking for existing profile:', fetchError);
      return;
    }
    
    // If no profile, create one
    if (!data) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          subscription_status: 'none'
        });
        
      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in profile creation:', error);
  }
};
