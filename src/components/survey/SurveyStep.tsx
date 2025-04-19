
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface SurveyStepProps {
  fields: {
    id: string;
    label: string;
    type: "radio" | "textarea";
    options?: string[];
  }[];
  formData: Record<string, string>;
  updateFormData: (id: string, value: string) => void;
}

export function SurveyStep({ fields, formData, updateFormData }: SurveyStepProps) {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label>{field.label}</Label>
          {field.type === "radio" ? (
            <RadioGroup
              value={formData[field.id]}
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
              value={formData[field.id]}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              placeholder="Type your answer here..."
            />
          )}
        </div>
      ))}
    </div>
  );
}
