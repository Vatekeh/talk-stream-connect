
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NsfwTimePattern } from "@/types";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { Calendar, BarChart as BarChartIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ActivityPatternsProps {
  timePatterns: NsfwTimePattern[];
}

export function ActivityPatterns({ timePatterns }: ActivityPatternsProps) {
  const chartConfig = {
    visits: {
      label: "Visits",
      theme: {
        light: "#1D4ED8",
        dark: "#3B82F6",
      },
    },
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dailyPatterns = daysOfWeek.map((day, index) => ({
    day,
    visits: timePatterns
      .filter(p => p.dayOfWeek === index)
      .reduce((sum, p) => sum + p.visitCount, 0)
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time of Day Patterns
          </CardTitle>
          <CardDescription>
            When you most frequently access NSFW content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={timePatterns.slice(0, 24)}>
                <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                <YAxis />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent formatter={(value) => `${value} visits`} />
                  } 
                />
                <Bar 
                  dataKey="visitCount" 
                  name="visits"
                  radius={4} 
                  fill="var(--color-visits)" 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            Day of Week Patterns
          </CardTitle>
          <CardDescription>
            Which days you tend to access NSFW content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={dailyPatterns}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent formatter={(value) => `${value} visits`} />
                  } 
                />
                <Bar 
                  dataKey="visits" 
                  name="visits"
                  radius={4} 
                  fill="var(--color-visits)" 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
