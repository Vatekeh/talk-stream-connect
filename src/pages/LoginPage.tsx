
/**
 * LoginPage Component
 * 
 * Handles user authentication with multiple options:
 * - Email/password login
 * - New account signup
 * 
 * Redirects authenticated users to the homepage.
 */
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "@/components/auth/auth-header";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

export default function LoginPage() {
  // Get authentication context and loading state
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to homepage
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Authentication header component */}
      <AuthHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="animate-in">
            {/* Card header with title and description */}
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome to Clutch</CardTitle>
              <CardDescription>
                Sign in to connect with support professionals
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Tabs for switching between login and signup forms */}
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                {/* Login form tab content */}
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                
                {/* Signup form tab content */}
                <TabsContent value="signup">
                  <SignupForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
