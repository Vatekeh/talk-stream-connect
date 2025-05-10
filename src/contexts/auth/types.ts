
import { User, Session } from "@supabase/supabase-js";

/**
 * Authentication context type definition
 */
export interface AuthContextType {
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
