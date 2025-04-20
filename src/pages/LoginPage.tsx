
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
    // Add console logs to track the authentication flow
    console.log("LoginPage - Current user:", user);
    console.log("LoginPage - Is loading:", isLoading);
    
    // If URL contains '#' it might be a redirect from OAuth provider
    if (window.location.hash) {
      console.log("Auth redirect detected with hash:", window.location.hash);
    }
  }, [user, isLoading]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    await signInWithGoogle();
    // We leave signingIn true as the page will redirect or be refreshed
  };

  if (user?.user_metadata?.phone_number && !isLoading) {
    console.log("User has phone number, redirecting to home");
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
