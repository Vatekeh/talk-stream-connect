
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

export default function ExtensionAuthCallback() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeAuth = async () => {
      try {
        console.log("Running auth callback process");
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          throw new Error(error?.message || "Authentication failed");
        }

        console.log("Session obtained, preparing extension callback");
        // Extract the token and user ID
        const { access_token, user } = data.session;
        
        // Create the hash fragment that the extension expects
        const hash = `#token=${access_token}&userId=${user.id}`;
        
        console.log("Redirecting to extension callback with hash fragment");
        // Redirect to the extension callback URL with the hash fragment
        // This should match what the extension is listening for in background.js
        window.location.replace(`${window.location.origin}/auth/callback${hash}`);
      } catch (err: any) {
        console.error("Authentication callback error:", err);
        setError(err.message || "Authentication failed");
        setIsLoading(false);
      }
    };

    completeAuth();
  }, []);

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
