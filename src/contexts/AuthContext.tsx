
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

  // Function to handle initial session setup
  const handleAuthChange = (event: string, newSession: Session | null) => {
    console.log("Auth state changed:", event, newSession?.user?.id);
    
    // Update state synchronously
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setIsLoading(false);

    // Defer profile operations to prevent auth deadlock
    if (newSession?.user) {
      setTimeout(async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({ last_activity: new Date().toISOString() })
              .eq('id', newSession.user.id);
          }
        } catch (error) {
          console.error("Error updating last activity:", error);
        }
      }, 0);
    }
  };

  useEffect(() => {
    console.log("AuthProvider initialized, setting up listeners");

    // Handle any hash fragments or query params from OAuth
    if (window.location.hash || window.location.search.includes('access_token')) {
      console.log("Found OAuth parameters in URL");
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession?.user?.id || "No session");
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup hash fragments after auth processing
    const timeout = setTimeout(() => {
      if (window.location.hash) {
        console.log("Cleaning up hash fragments");
        // Use history API instead of directly modifying location.hash
        const cleanURL = window.location.href.split('#')[0];
        window.history.replaceState(null, '', cleanURL);
      }
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("Initiating Google sign in");
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
      throw error; // Rethrow for handling in the component
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
      toast.success("Phone number updated successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Phone update error:", error);
      toast.error(error.message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message);
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
