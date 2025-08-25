
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStats } from "@/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Eye, Globe, Hash } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProfileStatsProps {
  stats: UserStats | null;
  insights?: any;
  loading?: boolean;
}

export function ProfileStats({ stats, insights, loading }: ProfileStatsProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
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
              Time Watching NSFW
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-destructive mr-2" />
              <span className="text-2xl font-bold">{formatTime(stats.timeInRooms)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              NSFW Sources Visited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-destructive mr-2" />
              <span className="text-2xl font-bold">{stats.roomsJoined}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total NSFW Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Hash className="h-5 w-5 text-destructive mr-2" />
              <span className="text-2xl font-bold">{stats.messagesPosted}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {viewMode === 'weekly' ? 'Weekly' : 'Monthly'} NSFW Activity
              </CardTitle>
              <CardDescription>
                Time spent watching NSFW content over the past {viewMode === 'weekly' ? 'week' : '30 days'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('weekly')}
              >
                Weekly
              </Button>
              <Button
                variant={viewMode === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('monthly')}
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <BarChart data={viewMode === 'weekly' ? stats.weeklyActivity : stats.monthlyActivity}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return viewMode === 'weekly' 
                      ? date.toLocaleDateString(undefined, { weekday: 'short' })
                      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => viewMode === 'weekly' ? `${value}m` : `${Math.floor(value / 60)}h`}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => viewMode === 'weekly' ? `${value} minutes` : formatTime(Number(value))}
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
      
      {/* Content Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Content Insights</CardTitle>
            <CardDescription>
              Analysis of your content browsing patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{insights.totalVisits || 0}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Top Source</p>
                <p className="text-lg font-bold">
                  {insights.topSources && insights.topSources.length > 0 
                    ? insights.topSources[0].source 
                    : 'None'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Average Duration</p>
                <p className="text-2xl font-bold">
                  {insights.averageDuration ? formatTime(Math.floor(insights.averageDuration / 60)) : '0m'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
