
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireModerator?: boolean;
}

export function ProtectedRoute({ children, requireModerator = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const [isCheckingModerator, setIsCheckingModerator] = useState(requireModerator);

  useEffect(() => {
    // Handle authentication check
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }
    
    // Check moderator status only if required
    if (requireModerator && user && isModerator === null) {
      checkModeratorStatus(user.id);
    }
  }, [user, isLoading, navigate, requireModerator, isModerator]);
  
  // Function to check if the user is a moderator
  const checkModeratorStatus = async (userId: string) => {
    try {
      setIsCheckingModerator(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_moderator')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data?.is_moderator) {
        // Not a moderator, redirect to home
        navigate("/");
        toast.error("You don't have permission to access this page");
      }
      
      setIsModerator(data?.is_moderator || false);
    } catch (error) {
      console.error("Error checking moderator status:", error);
      navigate("/");
    } finally {
      setIsCheckingModerator(false);
    }
  };

  if (isLoading || (requireModerator && isCheckingModerator)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Only render children if moderator check passes or is not required
  if (requireModerator && !isModerator) {
    return null; // This will prevent brief flashes of content
  }

  return <>{children}</>;
}
