
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { surveySteps } from "@/components/survey/surveySteps";

export interface SurveyFormData {
  feeling: string;
  motivation: string;
  journey_duration: string;
  virginity_status: string;
  nsfw_start_age: string;
  longest_streak: string;
  goal_frequency: string;
  future_goal_significance: string;
  motivation_factors: string;
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
    future_goal_significance: "",
    motivation_factors: "",
    biggest_challenge: "",
    most_rewarding: ""
  });

  const getFutureGoalQuestion = (longestStreak: string) => {
    if (!longestStreak) return "What would reaching a one-year streak mean to you?";
    
    const streakToMonths: Record<string, number> = {
      "Less than a week": 0.25,
      "Less than two weeks": 0.5,
      "Less than a month": 1,
      "Less than 3 months": 3,
      "More than 3 months": 12
    };
    
    const currentMonths = streakToMonths[longestStreak] || 12;
    const nextGoal = currentMonths >= 12 ? "two-year" : "one-year";
    
    return `What would reaching a ${nextGoal} streak mean to you?`;
  };

  const updateFormData = (id: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [id]: value };
      
      // Update the future goal question when longest_streak changes
      if (id === "longest_streak") {
        const fields = surveySteps[3].fields;
        const futureGoalField = fields.find(f => f.id === "future_goal_significance");
        if (futureGoalField) {
          futureGoalField.label = getFutureGoalQuestion(value);
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert([{ 
          ...formData, 
          user_id: user.id,
          // Map future_goal_significance to success_definition to maintain database compatibility
          success_definition: formData.future_goal_significance 
        }]);
      
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
