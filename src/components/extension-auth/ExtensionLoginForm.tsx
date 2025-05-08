
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ExtensionLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Handle login with email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[${new Date().toISOString()}] Login attempt started for email: ${email}`);
      console.log("[ExtensionLoginForm] Current origin:", window.location.origin);
      
      // Removed the redirectTo option which was causing the TypeScript error
      console.log("[ExtensionLoginForm] Calling supabase.auth.signInWithPassword");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log("[ExtensionLoginForm] signInWithPassword response:", {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error ? { message: error.message, code: error.code } : null
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`[${new Date().toISOString()}] Login successful, user ID: ${data.user?.id}`);
      console.log("[ExtensionLoginForm] Session object:", {
        token: data.session?.access_token ? "Present (hidden)" : "Missing",
        expiresAt: data.session?.expires_at,
        userId: data.user?.id
      });
      
      toast({
        title: "Login successful",
        description: "You are now logged in to Clutsh"
      });
      
      // The auth state change will trigger a redirect handled by the callback page
      console.log("[ExtensionLoginForm] Auth completed, waiting for callback handling");
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Authentication error:`, error);
      console.error("[ExtensionLoginForm] Detailed error:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      setError(error.message);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "Login failed. Please try again."
      });
    }
  };

  return (
    <>
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
    </>
  );
}
