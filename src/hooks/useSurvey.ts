
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SurveyFormData {
  feeling: string;
  motivation: string;
  journey_duration: string;
  virginity_status: string;
  nsfw_start_age: string;
  longest_streak: string;
  goal_frequency: string;
  motivation_factors: string;
  success_definition: string;
  biggest_challenge: string;
  most_rewarding: string;
}

export function useSurvey() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SurveyFormData>({
    feeling: "",
    motivation: "",
    journey_duration: "",
    virginity_status: "",
    nsfw_start_age: "",
    longest_streak: "",
    goal_frequency: "",
    motivation_factors: "",
    success_definition: "",
    biggest_challenge: "",
    most_rewarding: ""
  });

  const updateFormData = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert([{ ...formData, user_id: user.id }]);
      
      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ survey_completed: true })
        .eq('id', user.id);

      toast.success("Survey completed successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    loading,
    handleSubmit
  };
}
