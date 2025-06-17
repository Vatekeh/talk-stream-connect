
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Environment detection - improved to handle all scenarios
const getEnvironmentConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Development environments
  if (hostname === "localhost" || hostname.includes("127.0.0.1")) {
    return {
      baseUrl: `${protocol}//${hostname}${port ? ':' + port : ''}`,
      environment: "development"
    };
  }
  
  // Lovable preview environments
  if (hostname.includes(".lovable.app") || hostname.includes(".lovable.dev")) {
    return {
      baseUrl: `${protocol}//${hostname}`,
      environment: "preview"
    };
  }
  
  // Production environment
  return {
    baseUrl: "https://clutsh.live",
    environment: "production"
  };
};

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
      
      const envConfig = getEnvironmentConfig();
      console.log("[ExtensionLoginForm] Environment config:", envConfig);
      
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
      
      toast({
        title: "Login successful",
        description: "You are now logged in to Clutsh"
      });
      
      // After successful login, manually redirect to the callback page with token and userId
      if (data.session?.access_token && data.user?.id) {
        // Create the hash fragment that the extension expects
        const hash = `#token=${data.session.access_token}&userId=${data.user.id}`;
        
        // Use environment-detected base URL
        const callbackUrl = `${envConfig.baseUrl}/auth/callback${hash}`;
        
        console.log("[ExtensionLoginForm] Redirecting to callback URL:", {
          baseUrl: envConfig.baseUrl,
          environment: envConfig.environment,
          hashLength: hash.length,
          fullUrl: callbackUrl
        });

        // Add a slight delay before redirecting to ensure logs are captured and toast is shown
        setTimeout(() => {
          // Redirect to the extension callback URL with the hash fragment
          window.location.replace(callbackUrl);
        }, 300);
      } else {
        console.error("[ExtensionLoginForm] Cannot redirect: Missing token or user ID");
        setError("Authentication successful but session data is incomplete. Please try again.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Authentication error:`, error);
      
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
