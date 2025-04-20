
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface RequireSurveyProps {
  children: React.ReactNode;
}

export function RequireSurvey({ children }: RequireSurveyProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  useEffect(() => {
    const checkSurveyStatus = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('survey_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setSurveyCompleted(data?.survey_completed || false);
        
        if (!data?.survey_completed) {
          navigate('/survey');
        }
      } catch (error) {
        console.error('Error checking survey status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSurveyStatus();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!surveyCompleted) {
    return null;
  }

  return <>{children}</>;
}
