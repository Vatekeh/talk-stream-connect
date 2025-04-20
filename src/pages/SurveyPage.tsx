
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SurveyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    feeling: "",
    motivation: "",
    journey_duration: "",
    virginity_status: "",
    nsfw_start_age: "",
    longest_streak: "",
    goal_frequency: "",
    motivation_factors: "",
    success_definition: "",
    most_rewarding: "",
    biggest_challenge: ""
  });

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert([{ ...responses, user_id: user?.id }]);

      if (error) throw error;

      // Update the user's profile to mark survey as completed
      await supabase
        .from('profiles')
        .update({ survey_completed: true })
        .eq('id', user?.id);

      toast.success("Survey completed successfully!");
      navigate('/');
    } catch (error: any) {
      toast.error("Failed to submit survey: " + error.message);
    }
  };

  const updateResponse = (field: string, value: string) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const questions = [
    {
      title: "How are you feeling today?",
      type: "radio",
      field: "feeling",
      options: [
        "Energized and focused",
        "Okay, but could be better",
        "Struggling or feeling low",
        "Prefer not to say"
      ]
    },
    // ... Add more questions following the same pattern
  ];

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Pre-Dashboard Survey</CardTitle>
          <CardDescription>Your Journey to Better Habits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentQuestion.type === "radio" && (
              <RadioGroup
                value={responses[currentQuestion.field as keyof typeof responses]}
                onValueChange={(value) => updateResponse(currentQuestion.field, value)}
              >
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentStep === questions.length - 1 ? "Submit" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyPage;
