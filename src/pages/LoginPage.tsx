
/**
 * LoginPage component provides a clean, modern authentication interface
 * Features email/password and Google sign-in options
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  // State management for form inputs and UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles form submission for email/password login
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock login - replace with actual authentication
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  /**
   * Handles Google sign-in attempt
   */
  const handleGoogleLogin = () => {
    setLoading(true);
    
    // Mock Google login - replace with actual authentication
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left side - Hero Image */}
      <div 
        className="bg-[#1A1F2C] relative"
        style={{
          backgroundImage: `url('/lovable-uploads/083a9022-768b-44ea-9f39-3b0b020a9b9c.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center bg-[#1A1F2C] p-8">
        <Card className="w-full max-w-md bg-transparent border-none shadow-none">
          <CardHeader className="space-y-2 text-left">
            <CardTitle className="text-4xl font-bold text-[#e2d1c3]">
              Log in
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm text-[#C8C8C9]" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-[#8A898C] pl-10"
                    placeholder="name@example.com"
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[#8A898C]" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm text-[#C8C8C9]" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-[#8A898C] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#8A898C]"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#1EAEDB] hover:bg-[#0FA0CE]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Log in"}
              </Button>

              {/* Sign up link */}
              <div className="text-center">
                <span className="text-[#8A898C]">Don't have an account? </span>
                <Link to="/signup" className="text-[#1EAEDB] hover:underline">
                  Sign up
                </Link>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#8A898C]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1A1F2C] px-2 text-[#8A898C]">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-in Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border-[#8A898C] text-white hover:bg-[#2A2F3C]"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
