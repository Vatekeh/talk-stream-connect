import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock } from "lucide-react";

export function ExtensionSignupForm() {
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [username, setUsername] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  
  // Handle signup with email/password
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);
    
    try {
      console.log("Attempting signup with:", signupEmail);
      
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
        throw error;
      }
      
      // Show a success message but keep on the page in case email verification is required
      setSignupError("Please check your email to verify your account, then you can sign in.");
      setSignupLoading(false);
    } catch (error: any) {
      console.error("Signup error:", error);
      setSignupError(error.message);
      setSignupLoading(false);
    }
  };

  return (
    <>
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
    </>
  );
}
