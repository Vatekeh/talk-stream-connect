
/**
 * ExtensionAuthPage
 * 
 * This page provides authentication for the browser extension.
 * It renders a login form that uses email/password authentication
 * and redirects to the callback URL with the appropriate session.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ExtensionAuthPage() {
  // State for login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [username, setUsername] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  
  // Handle login with email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error("Authentication error:", error);
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Handle signup with email/password
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);
    
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          name: username || signupEmail.split('@')[0]
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error("Signup error:", error);
      setSignupError(error.message);
      setSignupLoading(false);
    } else {
      // Show a success message but keep on the page in case email verification is required
      setSignupError("Please check your email to verify your account, then you can sign in.");
      setSignupLoading(false);
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
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-clutsh-navy">
                <TabsTrigger value="login" className="data-[state=active]:bg-clutsh-slate data-[state=active]:text-clutsh-light">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-clutsh-slate data-[state=active]:text-clutsh-light">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                {error && (
                  <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/30">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-clutsh-light">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-clutsh-muted" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-clutsh-light">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-clutsh-muted" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Signup Tab */}
              <TabsContent value="signup">
                {signupError && (
                  <Alert variant={signupError.includes("check your email") ? "default" : "destructive"} 
                         className={signupError.includes("check your email") 
                         ? "mb-4 bg-green-500/10 border-green-500/30" 
                         : "mb-4 bg-red-500/10 border-red-500/30"}>
                    <AlertDescription className={signupError.includes("check your email") 
                                              ? "text-green-400" 
                                              : "text-red-400"}>
                      {signupError}
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-clutsh-light">Username (optional)</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Your name" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-clutsh-light">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-clutsh-muted" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={signupEmail} 
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-clutsh-light">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-clutsh-muted" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={signupPassword} 
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel" 
                    disabled={signupLoading}
                  >
                    {signupLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
