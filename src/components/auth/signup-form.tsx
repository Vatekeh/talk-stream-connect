
/**
 * SignupForm Component
 * 
 * Handles user registration with name, email, and password.
 * Provides form validation and loading state.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  // Get authentication function from context
  const { signUp } = useAuth();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission for account creation
   * Prevents default form behavior and manages loading state
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, name);
    setLoading(false);
  };

  // Improved change handlers with better event management
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {/* Name input field with improved event handling */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-clutsh-light">Name</Label>
        <Input 
          id="name" 
          placeholder="Your Name" 
          value={name} 
          onChange={handleNameChange}
          required
          className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light"
        />
      </div>
      
      {/* Email input field with improved event handling */}
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-clutsh-light">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="your@email.com" 
          value={email} 
          onChange={handleEmailChange}
          required
          className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light"
        />
      </div>
      
      {/* Password input field with improved event handling */}
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-clutsh-light">Password</Label>
        <Input 
          id="signup-password" 
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={handlePasswordChange}
          required
          className="bg-clutsh-navy border-clutsh-slate focus-visible:ring-clutsh-light"
        />
      </div>
      
      {/* Submit button with loading state */}
      <Button 
        type="submit" 
        className="w-full bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : "Create Account"}
      </Button>
    </form>
  );
}
