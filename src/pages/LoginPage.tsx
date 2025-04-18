
/**
 * LoginPage component handles user authentication with email/password and anonymous login
 * Provides both login and signup functionality in a tabbed interface
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  // Navigation and loading state management
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  /**
   * Handles user login form submission
   * Currently uses mock implementation with setTimeout
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // This would be replaced with actual Supabase authentication
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
  };
  
  /**
   * Handles new user registration form submission
   * Currently uses mock implementation with setTimeout
   */
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // This would be replaced with actual Supabase authentication
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
  };
  
  /**
   * Handles anonymous user login
   * Currently uses mock implementation with setTimeout
   */
  const handleAnonymousLogin = () => {
    setLoading(true);
    
    // This would be replaced with actual Supabase anonymous auth
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo and branding */}
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-talkstream-purple text-white font-semibold">
              TS
            </div>
            <span className="font-semibold text-lg">TalkStream</span>
          </Link>
        </div>
      </header>
      
      {/* Main content with authentication forms */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="animate-in">
            {/* Card header with title and description */}
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome to TalkStream</CardTitle>
              <CardDescription>
                Sign in to join live voice and chat rooms
              </CardDescription>
            </CardHeader>
            
            {/* Card content with login/signup tabs */}
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                {/* Tab navigation */}
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                {/* Login tab content */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-xs text-talkstream-purple hover:underline">
                          Forgot?
                        </Link>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Signup tab content */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Your Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            {/* Card footer with anonymous login option */}
            <CardFooter className="flex flex-col">
              <div className="relative w-full mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleAnonymousLogin}
                disabled={loading}
              >
                Continue as Guest
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
