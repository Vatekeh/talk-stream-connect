
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "@/components/auth/auth-header";
import { PhoneVerification } from "@/components/auth/phone-verification";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    // If URL contains '#' it might be a redirect from Supabase Auth
    if (window.location.hash) {
      // Let the Supabase client handle the hash
      const timeout = setTimeout(() => {
        // Clear any OAuth related hash fragments
        if (window.location.hash) {
          window.location.hash = '';
        }
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    await signInWithGoogle();
    // We don't need to reset signingIn as the page will redirect
  };

  if (user?.user_metadata?.phone_number && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome to Clutch</CardTitle>
              <CardDescription>
                {user ? 'Please verify your phone number' : 'Sign in to connect with support professionals'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : user ? (
                <PhoneVerification />
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                >
                  {signingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Continue with Google"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
