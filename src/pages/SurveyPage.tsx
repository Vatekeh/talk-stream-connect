
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SurveyStep } from "@/components/survey/SurveyStep";
import { surveySteps } from "@/components/survey/surveySteps";
import { useSurvey } from "@/hooks/useSurvey";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";
import { useEffect } from "react";

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
  const isLastStep = currentStep === surveySteps.length - 1;

  const isStepValid = () => {
    return currentStepData.fields.every(field => 
      formData[field.id as keyof typeof formData]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: false
            }}
            className="w-full"
            setApi={(api) => {
              api?.on("select", () => {
                const selectedIndex = api.selectedScrollSnap();
                setCurrentStep(selectedIndex);
              });
            }}
          >
            <CarouselContent>
              {surveySteps.map((step, index) => (
                <CarouselItem key={index} className="pt-6">
                  <div className="space-y-6">
                    <SurveyStep
                      fields={step.fields}
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                    
                    <div className="flex justify-end pt-4">
                      {isLastStep ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!isStepValid() || loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      ) : (
                        <CarouselNext 
                          className="relative translate-x-0 translate-y-0 right-0"
                          disabled={!isStepValid()}
                        >
                          Next
                        </CarouselNext>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </CardContent>
      </Card>
    </div>
  );
}
