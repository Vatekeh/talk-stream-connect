
/**
 * ExtensionAuthCallback
 * 
 * This page handles the callback from Supabase auth for the browser extension.
 * It extracts the token and user ID from the session and redirects with a hash fragment
 * that the extension can parse.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Environment detection - can be expanded later if needed
const PRODUCTION_DOMAIN = "https://clutsh.live";
const isDevelopment = () => {
  return window.location.hostname === "localhost" || 
         window.location.hostname.includes("127.0.0.1") ||
         window.location.hostname.includes(".lovable.dev");
};

export default function ExtensionAuthCallback() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const startTime = new Date();
        console.log(`[${startTime.toISOString()}] Running auth callback process`);
        console.log("[ExtensionAuthCallback] Document URL:", window.location.href);
        console.log("[ExtensionAuthCallback] Current origin:", window.location.origin);
        
        // Check for hash fragments that might have been passed
        if (window.location.hash) {
          console.log("[ExtensionAuthCallback] Hash fragment detected:", window.location.hash);
        }
        
        console.log("[ExtensionAuthCallback] Calling supabase.auth.getSession()");
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        console.log("[ExtensionAuthCallback] Session data received:", {
          hasData: !!data,
          hasSession: !!data.session,
          sessionExpiry: data.session?.expires_at,
          error: error ? { message: error.message } : null
        });
        
        if (error || !data.session) {
          console.error("[ExtensionAuthCallback] Auth callback failed, no session:", error);
          throw new Error(error?.message || "Authentication failed - No session available");
        }

        console.log("[ExtensionAuthCallback] Session obtained, preparing extension callback", {
          userId: data.session.user.id,
          hasAccessToken: !!data.session.access_token
        });
        
        // Extract the token and user ID
        const { access_token, user } = data.session;
        
        if (!access_token) {
          console.error("[ExtensionAuthCallback] Missing access token in session");
          throw new Error("Authentication failed - No access token");
        }
        
        if (!user || !user.id) {
          console.error("[ExtensionAuthCallback] Missing user ID in session");
          throw new Error("Authentication failed - No user ID");
        }
        
        // Create the hash fragment that the extension expects
        const hash = `#token=${access_token}&userId=${user.id}`;
        console.log("[ExtensionAuthCallback] Created hash fragment:", { 
          tokenPresent: !!access_token, 
          userIdPresent: !!user.id,
          hashLength: hash.length 
        });
        
        // Determine the base URL - use the production domain in production env
        const baseUrl = isDevelopment() ? window.location.origin : PRODUCTION_DOMAIN;
        
        // Construct the callback URL with the exact path that the extension expects
        const callbackUrl = `${baseUrl}/auth/callback${hash}`;
        console.log("[ExtensionAuthCallback] Redirecting to extension callback URL:", {
          baseUrl,
          environment: isDevelopment() ? "development" : "production",
          fullUrl: callbackUrl
        });
        
        // Notify user before redirect
        toast({
          title: "Authentication successful",
          description: "Connecting to extension..."
        });
        
        const elapsedMs = new Date().getTime() - startTime.getTime();
        console.log(`[${new Date().toISOString()}] Auth callback completed in ${elapsedMs}ms, redirecting now`);
        
        // Add a slight delay before redirecting to ensure logs are captured
        setTimeout(() => {
          // Redirect to the extension callback URL with the hash fragment
          window.location.replace(callbackUrl);
        }, 300); // Increased timeout to ensure logs are captured
      } catch (err: any) {
        console.error(`[${new Date().toISOString()}] Authentication callback error:`, err);
        console.error("[ExtensionAuthCallback] Detailed error:", {
          message: err.message,
          stack: err.stack
        });
        
        setError(err.message || "Authentication failed");
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: err.message || "Could not complete authentication"
        });
      }
    };

    completeAuth();
  }, [toast]);

  // If there's an error, show it and provide a link back to login
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-clutsh-midnight p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Authentication Failed</h2>
          <p className="text-clutsh-light mb-4">{error}</p>
          <a 
            href="/auth" 
            className="inline-block px-4 py-2 bg-clutsh-slate text-clutsh-light rounded hover:bg-clutsh-steel transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-clutsh-midnight">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-clutsh-light mb-4" />
        <p className="text-clutsh-light text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}
