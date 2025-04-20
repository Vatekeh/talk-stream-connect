
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "@/components/auth/auth-header";
import { PhoneVerification } from "@/components/auth/phone-verification";

export default function LoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();

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
                Sign in to connect with support professionals
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {user ? (
                <PhoneVerification />
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={signInWithGoogle}
                >
                  Continue with Google
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
