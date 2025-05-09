
/**
 * AuthContext
 * 
 * Provides authentication state and functions throughout the application.
 * Handles user sessions, profile creation, and authentication actions.
 * Also provides subscription management functionality.
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
  
  // Subscription-related properties and functions
  subscriptionStatus: string | null;
  isSubscribed: boolean;
  isTrialing: boolean;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  createSubscription: () => Promise<void>;
  manageSubscription: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
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
  
  // State for subscription data
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isTrialing, setIsTrialing] = useState(false);
  const [trialEnd, setTrialEnd] = useState<Date | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  
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
            // Also check subscription status on sign in
            checkSubscriptionStatus();
          }, 0);
        }
        
        // When signing out, reset subscription data
        if (event === 'SIGNED_OUT') {
          setSubscriptionStatus(null);
          setIsSubscribed(false);
          setIsTrialing(false);
          setTrialEnd(null);
          setCurrentPeriodEnd(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // If user is logged in, ensure they have a profile and check subscription
      if (session?.user) {
        createProfileIfNeeded(session.user);
        checkSubscriptionStatus();
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
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/login");
      toast.success("Signed out successfully");
    }
  };
  
  /**
   * Create subscription function - creates a new subscription for the user
   * with a 30-day free trial
   */
  const createSubscription = async () => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      navigate("/login");
      return;
    }
    
    try {
      toast.loading("Setting up your subscription...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || "Failed to create subscription");
      
      // Update subscription state
      await checkSubscriptionStatus();
      
      toast.dismiss();
      toast.success("Your 30-day free trial has been activated!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
      console.error("Error creating subscription:", error);
    }
  };
  
  /**
   * Manage subscription function - redirects the user to the Stripe billing portal
   */
  const manageSubscription = async () => {
    if (!user) {
      toast.error("You must be logged in to manage your subscription");
      navigate("/login");
      return;
    }
    
    try {
      toast.loading("Preparing billing portal...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      
      const { data, error } = await supabase.functions.invoke('billing-portal', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data.url) throw new Error("Failed to create billing portal session");
      
      toast.dismiss();
      
      // Redirect to Stripe billing portal
      window.location.href = data.url;
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
      console.error("Error managing subscription:", error);
    }
  };
  
  /**
   * Check subscription status - fetches current subscription data from the server
   */
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }
      
      // Update subscription state
      setSubscriptionStatus(data.subscription_status);
      setIsSubscribed(data.is_subscribed);
      setIsTrialing(data.is_trialing);
      setTrialEnd(data.trial_end ? new Date(data.trial_end) : null);
      setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
      
      console.log("Subscription checked:", data);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      subscriptionStatus,
      isSubscribed,
      isTrialing,
      trialEnd,
      currentPeriodEnd,
      createSubscription,
      manageSubscription,
      checkSubscriptionStatus
    }}>
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
