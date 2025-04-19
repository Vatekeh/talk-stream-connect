
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SurveyStep } from "@/components/survey/SurveyStep";
import { surveySteps } from "@/components/survey/surveySteps";
import { useSurvey } from "@/hooks/useSurvey";

export default function SurveyPage() {
  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    loading,
    handleSubmit
  } = useSurvey();

  const currentStepData = surveySteps[currentStep];

  const isStepValid = () => {
    return currentStepData.fields.every(field => 
      formData[field.id as keyof typeof formData]
    );
  };

  const isLastStep = currentStep === surveySteps.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Pre-Dashboard Survey</CardTitle>
          <CardDescription>
            Help us understand your journey better ({currentStep + 1}/{surveySteps.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <SurveyStep
              fields={currentStepData.fields}
              formData={formData}
              updateFormData={updateFormData}
            />
            
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
