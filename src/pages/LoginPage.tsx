
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
import { Shield } from "lucide-react";

export default function LoginPage() {
  // Get authentication context and loading state
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to homepage
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-clutsh-midnight">
      {/* Authentication header component */}
      <AuthHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex overflow-hidden rounded-lg shadow-lg">
          {/* Left side: Image */}
          <div className="hidden md:block w-1/2 bg-clutsh-slate">
            <img 
              src="/lovable-uploads/f6617d82-9257-4618-bd1e-c81e35bc55fa.png" 
              alt="Clutsh hands clasped together" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Right side: Authentication form */}
          <div className="w-full md:w-1/2 bg-clutsh-steel p-8">
            <Card className="animate-in border-clutsh-slate bg-clutsh-steel/50 shadow-lg">
              {/* Card header with title and description */}
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl text-clutsh-light">Welcome to Clutsh</CardTitle>
                <CardDescription className="text-clutsh-muted">
                  Sign in to connect with support professionals
                </CardDescription>
                
                {/* Free trial banner */}
                <div className="mt-2 px-3 py-2 bg-clutsh-navy border border-clutsh-slate rounded-md">
                  <div className="flex items-center justify-center text-amber-500 gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">30-Day Free Trial</span>
                  </div>
                  <p className="text-xs text-clutsh-light mt-1">
                    Sign up today and get full access to premium features
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Tabs for switching between login and signup forms */}
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-clutsh-navy">
                    <TabsTrigger value="login" className="data-[state=active]:bg-clutsh-slate data-[state=active]:text-clutsh-light">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-clutsh-slate data-[state=active]:text-clutsh-light">Sign Up</TabsTrigger>
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
        </div>
      </main>
    </div>
  );
}
