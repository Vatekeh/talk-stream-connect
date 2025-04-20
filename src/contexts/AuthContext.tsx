
/**
 * AuthContext provides user authentication state and utilities (sign in, sign out, update profile).
 * Manages both user and session state for Supabase authentication, and supports Google login.
 * 
 * @context
 *  user - User object from Supabase, null if not authenticated
 *  session - Session object containing auth tokens
 *  isLoading - Whether authentication is being determined
 *  signInWithGoogle - Async function to log in with Google
 *  signOut - Async function to log out from the app
 *  updatePhoneNumber - Async function to update user's phone number
 * 
 * Must be wrapped in an <AuthProvider> for any component using the useAuth hook.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updatePhoneNumber: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component: provides authentication context to children.
 * - Handles onAuthStateChange with Supabase.
 * - Handles redirect-to-login when not logged in.
 * - Updates local state immediately for responsive UI on logout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.info("AuthProvider initialized, setting up listeners");
    
    // Set up auth change listener before checking session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.info(`Auth state changed: ${event}`, currentSession);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Update profile activity timestamp, if logged in.
        if (currentSession?.user) {
          // Use setTimeout to avoid SDK deadlocks.
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();

              if (profile) {
                await supabase
                  .from('profiles')
                  .update({ last_activity: new Date().toISOString() })
                  .eq('id', currentSession.user.id);
              }
            } catch (error) {
              console.error("Error updating profile:", error);
            }
          }, 0);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.info("Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup the listener on unmount
    return () => {
      subscription.unsubscribe();
      console.info("Auth state listener unsubscribed");
    };
  }, []);

  /**
   * Starts the Google OAuth sign-in flow.
   * If error occurs, shows a toast message.
   */
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/login'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google: " + error.message);
      throw error; // Propagate error for handling in the component
    }
  };

  /**
   * Updates phone number in both `profiles` and user metadata.
   * If successful, navigates to main page and shows a toast.
   */
  const updatePhoneNumber = async (phone: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your phone number");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: phone })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update user metadata
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { phone_number: phone }
      });
      
      if (updateError) throw updateError;
      
      // Locally update user state
      if (data?.user) {
        setUser(data.user);
      }
      
      toast.success("Phone number updated successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Phone update error:", error);
      toast.error(error.message);
    }
  };

  /**
   * Signs out from Supabase AND clears local state for responsive UI.
   * Navigates to login page on success.
   */
  const signOut = async () => {
    try {
      console.log("Signing out user...");
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      console.log("Sign out successful, navigating to login page");
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out: " + error.message);
    }
  };

  // Wrap all state and functions in the AuthContext.Provider
  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signInWithGoogle, 
      signOut,
      updatePhoneNumber 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth() consumes AuthContext.
 * Throws an Error if used outside of an <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
