import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function SurveyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
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

  const steps = [
    {
      title: "Current State & Intentions",
      fields: [
        {
          id: "feeling",
          label: "How are you feeling today?",
          type: "radio",
          options: [
            "Energized and focused",
            "Okay, but could be better",
            "Struggling or feeling low",
            "Prefer not to say"
          ]
        },
        {
          id: "motivation",
          label: "What brings you here today?",
          type: "textarea"
        }
      ]
    },
    {
      title: "Your Journey",
      fields: [
        {
          id: "journey_duration",
          label: "How long have you been on the SR/NoFap journey?",
          type: "textarea"
        },
        {
          id: "virginity_status",
          label: "Do you still have your V-card?",
          type: "radio",
          options: ["Yes", "No", "Prefer not to say"]
        }
      ]
    },
    {
      title: "History & Goals",
      fields: [
        {
          id: "nsfw_start_age",
          label: "When did you first start consuming NSFW content?",
          type: "textarea"
        },
        {
          id: "longest_streak",
          label: "What has been your longest streak so far?",
          type: "textarea"
        },
        {
          id: "goal_frequency",
          label: "How often do you reach your streak goals?",
          type: "radio",
          options: ["Frequently", "Sometimes", "Rarely"]
        }
      ]
    },
    {
      title: "Motivation & Challenges",
      fields: [
        {
          id: "motivation_factors",
          label: "What keeps you motivated to keep trying?",
          type: "textarea"
        },
        {
          id: "success_definition",
          label: "What would you consider a successful outcome from using this app?",
          type: "textarea"
        },
        {
          id: "biggest_challenge",
          label: "What is the most daunting aspect of SR/NoFap for you?",
          type: "textarea"
        },
        {
          id: "most_rewarding",
          label: "What is the most rewarding aspect of it?",
          type: "textarea"
        }
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  const updateFormData = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const isStepValid = () => {
    return currentStepData.fields.every(field => 
      formData[field.id as keyof typeof formData]
    );
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Pre-Dashboard Survey</CardTitle>
          <CardDescription>
            Help us understand your journey better ({currentStep + 1}/{steps.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentStepData.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>{field.label}</Label>
                {field.type === "radio" ? (
                  <RadioGroup
                    value={formData[field.id as keyof typeof formData]}
                    onValueChange={(value) => updateFormData(field.id, value)}
                  >
                    <div className="space-y-2">
                      {field.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                          <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={formData[field.id as keyof typeof formData]}
                    onChange={(e) => updateFormData(field.id, e.target.value)}
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
            ))}
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                onClick={isLastStep ? handleSubmit : () => setCurrentStep(prev => prev + 1)}
                disabled={!isStepValid() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isLastStep ? "Submit" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
