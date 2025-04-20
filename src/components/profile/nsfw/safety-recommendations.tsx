
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { NsfwTimePattern, NsfwSourceSummary } from "@/types";

interface SafetyRecommendationsProps {
  timePatterns: NsfwTimePattern[];
  topSources: NsfwSourceSummary[];
}

export function SafetyRecommendations({ timePatterns, topSources }: SafetyRecommendationsProps) {
  const peakHour = timePatterns[0]?.hour;
  const topSource = topSources[0]?.source;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Safety Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-4">
            <h4 className="text-sm font-medium mb-2">Privacy & Safety Tips</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                <span>Consider using browser extensions that limit your access to certain sites during specific hours.</span>
              </li>
              {peakHour !== undefined && (
                <li className="flex gap-2">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                  <span>Your peak browsing time is between {peakHour}:00 - {peakHour + 1}:00. Consider scheduling alternative activities during this time.</span>
                </li>
              )}
              {topSource && (
                <li className="flex gap-2">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                  <span>Set up time limits for your most visited source: {topSource}.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
