
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
    // Handle auth state changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);

        if (newSession?.user) {
          // Don't make additional calls here directly, use setTimeout
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
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    // Handle redirect URL tokens (OAuth)
    if (window.location.hash) {
      console.log("Found hash in URL, handling potential OAuth redirect");
      const timeout = setTimeout(() => {
        // Clear any OAuth related hash fragments
        if (window.location.hash) {
          window.location.hash = '';
        }
      }, 1000);
      
      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    }

    return () => subscription.unsubscribe();
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
