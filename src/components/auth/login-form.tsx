
/**
 * LoginForm Component
 * 
 * Handles user login with email and password.
 * Provides form validation and loading state.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  // Get authentication function from context
  const { signIn } = useAuth();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission and authentication
   * Prevents default form behavior and manages loading state
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  // Improved change handlers with better event management
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Email input field with improved event handling */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="your@email.com" 
          value={email} 
          onChange={handleEmailChange}
          required
        />
      </div>
      
      {/* Password input field with improved event handling */}
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
          onChange={handlePasswordChange}
          required
        />
      </div>
      
      {/* Submit button with loading state */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : "Sign In"}
      </Button>
    </form>
  );
}
