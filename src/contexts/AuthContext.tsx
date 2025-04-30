
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // If a user just signed in, ensure they have a profile
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid Supabase deadlocks
          setTimeout(() => {
            createProfileIfNeeded(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // If user is logged in, ensure they have a profile
      if (session?.user) {
        createProfileIfNeeded(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Function to create a profile if it doesn't exist
  const createProfileIfNeeded = async (user: User) => {
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
            username: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in profile creation:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/");
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({ 
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/login");
      toast.success("Signed out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
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
