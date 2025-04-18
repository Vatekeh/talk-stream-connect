
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { UserStreak } from "@/types";

interface StreakOverviewProps {
  streak: UserStreak;
}

export function StreakOverview({ streak }: StreakOverviewProps) {
  const streakPercentage = streak.longest > 0 
    ? Math.min(100, (streak.current / streak.longest) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{streak.current}</span>
              <span className="text-muted-foreground mb-1">days clean</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress toward record</span>
                <span className="font-medium">{streakPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={streakPercentage} className="h-2" />
            </div>
            <Badge variant="secondary" className="w-fit">
              Top achievement
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Best Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{streak.longest}</span>
              <span className="text-muted-foreground mb-1">days</span>
            </div>
            <div className="space-y-2">
              {streak.current === streak.longest ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>At your best streak!</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {streak.longest - streak.current} more days to beat your record
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
