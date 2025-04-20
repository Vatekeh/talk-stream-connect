
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, ExternalLink, PieChart as PieChartIcon } from "lucide-react";

interface InsightsOverviewProps {
  totalVisits: number;
  totalDuration: number;
  averageDuration: number;
}

export function InsightsOverview({ totalVisits, totalDuration, averageDuration }: InsightsOverviewProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ExternalLink className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-2xl font-bold">{totalVisits}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Time Spent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-2xl font-bold">{formatDuration(totalDuration)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <PieChartIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-2xl font-bold">{formatDuration(averageDuration)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
