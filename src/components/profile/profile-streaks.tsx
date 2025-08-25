
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Award, CheckCircle } from "lucide-react";
import { UserStreak } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileStreaksProps {
  streak: UserStreak | null;
  loading?: boolean;
}

export function ProfileStreaks({ streak, loading }: ProfileStreaksProps) {
  // Show loading skeleton if data is loading or streak is null
  if (loading || !streak) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-end gap-2">
                    <Skeleton className="h-12 w-16" />
                    <Skeleton className="h-5 w-10" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate the percentage for the progress bar
  const streakPercentage = streak.longest > 0 
    ? Math.min(100, (streak.current / streak.longest) * 100) 
    : 0;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Calendar className="mr-2 h-5 w-5 text-talkstream-purple" />
              Current Streak
            </CardTitle>
            <CardDescription>
              Consecutive days without NSFW content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{streak.current}</span>
                <span className="text-muted-foreground mb-1">days</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress toward your record</span>
                  <span className="font-medium">{streakPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={streakPercentage} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated {formatDistanceToNow(new Date(streak.lastUpdated), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Award className="mr-2 h-5 w-5 text-talkstream-purple" />
              Longest Streak
            </CardTitle>
            <CardDescription>
              Your personal record
            </CardDescription>
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
                    <span>You're at your best streak!</span>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Streak Calendar</CardTitle>
          <CardDescription>
            Your activity over the past month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 flex items-center justify-center">
            <p className="text-muted-foreground">Calendar visualization will be implemented with Supabase integration</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
