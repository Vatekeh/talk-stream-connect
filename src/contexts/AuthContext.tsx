
/**
 * AuthContext
 * 
 * Provides authentication state and functions throughout the application.
 * Handles user sessions, profile creation, and authentication actions.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the application to provide
 * authentication state and functions to all children
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for authentication data
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
  
  /**
   * Creates a user profile in the database if it doesn't exist
   * Called after authentication to ensure all users have a profile
   */
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

  /**
   * Sign in function - authenticates user with email and password
   */
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

  /**
   * Sign up function - creates a new user account
   * Includes user metadata for profile creation
   */
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

  /**
   * Sign out function - logs the current user out
   * and redirects to login page
   */
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

/**
 * Custom hook to use the auth context
 * Throws an error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
