
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sign in function - authenticates user with email and password
 */
export const signIn = async (email: string, password: string, navigate: (path: string) => void) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    navigate("/");
    toast.success("Welcome back!");
  } catch (error: any) {
    toast.error(error.message);
  }
};

/**
 * Sign up function - creates a new user account
 * Includes user metadata for profile creation
 */
export const signUp = async (email: string, password: string, username?: string) => {
  try {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: {
        data: {
          name: username || email.split('@')[0]
        }
      }
    });
    
    if (error) throw error;
    
    toast.success("Welcome! Please check your email to verify your account.");
  } catch (error: any) {
    toast.error(error.message);
  }
};

/**
 * Sign out function - logs the current user out
 * and redirects to login page
 */
export const signOut = async (navigate: (path: string) => void) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast.error(error.message);
  } else {
    navigate("/login");
    toast.success("Signed out successfully");
  }
};
