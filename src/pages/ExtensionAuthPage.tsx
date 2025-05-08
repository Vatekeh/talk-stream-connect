
/**
 * ExtensionAuthPage
 * 
 * This page provides authentication for the browser extension.
 * It renders a simple page with a login button that redirects to Supabase OAuth.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ExtensionAuthPage() {
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'email', // Using email provider since we know it's already set up
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error("Authentication error:", error);
      alert("Authentication failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-clutsh-midnight">
      <header className="border-b border-clutsh-slate bg-clutsh-navy">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clutsh-slate text-clutsh-light font-semibold">
              C
            </div>
            <span className="font-semibold text-lg text-clutsh-light">Clutsh</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-clutsh-slate bg-clutsh-steel/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-clutsh-light">Clutsh Extension Login</CardTitle>
            <CardDescription className="text-clutsh-muted">
              Sign in to connect the Clutsh browser extension
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center">
            <Button 
              onClick={handleLogin} 
              className="w-full bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : "Continue with Clutsh Account"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
