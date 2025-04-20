
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.info("AuthProvider initialized, setting up listeners");
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.info(`Auth state changed: ${event}`, currentSession);
        
        // Update the session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Handle profile update after session data is set
        if (currentSession?.user) {
          // Use setTimeout to avoid Supabase SDK deadlocks
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

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.info("Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      console.info("Auth state listener unsubscribed");
    };
  }, []);

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
      
      // Update the local user state with new metadata
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

  const signOut = async () => {
    try {
      console.log("Signing out user...");
      
      // First clear the client-side session state to immediately update UI
      setUser(null);
      setSession(null);
      
      // Then perform the actual sign out with Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Ensures signout across all tabs/devices
      });
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      // Navigate to login page and show success message
      console.log("Sign out successful, navigating to login page");
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out: " + error.message);
    }
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
