
/**
 * AuthProvider
 * 
 * Provides authentication state and functions throughout the application.
 * Handles user sessions, profile creation, and authentication actions.
 * Also provides subscription management functionality.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { createProfileIfNeeded } from "./profile-utils";
import { createSubscription, manageSubscription, checkSubscriptionStatus } from "./subscription-utils";
import { signIn, signUp, signOut } from "./auth-utils";
import { AuthContextType } from "./types";

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
            fetchSubscriptionStatus();
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
        fetchSubscriptionStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const fetchSubscriptionStatus = async () => {
    if (!user) return;
    
    const data = await checkSubscriptionStatus(user.id);
    if (data) {
      // Update subscription state
      setSubscriptionStatus(data.subscription_status);
      setIsSubscribed(data.is_subscribed);
      setIsTrialing(data.is_trialing);
      setTrialEnd(data.trial_end ? new Date(data.trial_end) : null);
      setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
    }
  };
  
  // Authentication functions
  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password, navigate);
  };
  
  const handleSignUp = async (email: string, password: string, username?: string) => {
    await signUp(email, password, username);
  };
  
  const handleSignOut = async () => {
    await signOut(navigate);
  };
  
  // Subscription functions
  const handleCreateSubscription = async () => {
    await createSubscription(user?.id);
    await fetchSubscriptionStatus();
  };
  
  const handleManageSubscription = async () => {
    await manageSubscription(user?.id);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signIn: handleSignIn, 
      signUp: handleSignUp, 
      signOut: handleSignOut,
      subscriptionStatus,
      isSubscribed,
      isTrialing,
      trialEnd,
      currentPeriodEnd,
      createSubscription: handleCreateSubscription,
      manageSubscription: handleManageSubscription,
      checkSubscriptionStatus: fetchSubscriptionStatus
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
