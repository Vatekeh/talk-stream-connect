
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStats } from "@/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Clock, MessageCircle, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileStatsProps {
  stats: UserStats | null;
  loading?: boolean;
}

export function ProfileStats({ stats, loading }: ProfileStatsProps) {
  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  const chartConfig = {
    activity: {
      label: "Activity",
      theme: {
        light: "#8B5CF6",
        dark: "#8B5CF6",
      },
    },
  };

  // Show loading skeleton if data is loading or stats is null
  if (loading || !stats) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time in Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-talkstream-purple mr-2" />
              <span className="text-2xl font-bold">{formatTime(stats.timeInRooms)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rooms Joined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-talkstream-purple mr-2" />
              <span className="text-2xl font-bold">{stats.roomsJoined}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages Posted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 text-talkstream-purple mr-2" />
              <span className="text-2xl font-bold">{stats.messagesPosted}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>
            Time spent in rooms over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <BarChart data={stats.weeklyActivity}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { weekday: 'short' });
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}m`}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => `${value} minutes`}
                    />
                  } 
                />
                <Bar 
                  dataKey="duration" 
                  name="activity"
                  radius={4} 
                  fill="var(--color-activity)" 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>
            Time spent in rooms over the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <BarChart data={stats.monthlyActivity}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${Math.floor(value / 60)}h`}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => formatTime(Number(value))}
                    />
                  } 
                />
                <Bar 
                  dataKey="duration" 
                  name="activity"
                  radius={4} 
                  fill="var(--color-activity)" 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
