
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  Tooltip, PieChart, Pie, Cell 
} from "recharts";
import { 
  Activity,
  Award,
  Calendar,
  CheckCircle,
  Clock, 
  ExternalLink,
  Eye,
  Filter, 
  Link as LinkIcon,
  MessageCircle,
  PieChart as PieChartIcon,
  Search,
  Settings,
  Shield,
  Users 
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { NsfwContentLog, NsfwUserInsights, UserStats, UserStreak } from "@/types";

interface ProfileCombinedStatsProps {
  stats: UserStats;
  nsfwLogs: NsfwContentLog[];
  nsfwInsights: NsfwUserInsights;
  streak: UserStreak;
}

export function ProfileCombinedStats({ 
  stats, 
  nsfwLogs, 
  nsfwInsights,
  streak 
}: ProfileCombinedStatsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredLogs = nsfwLogs.filter(log => 
    log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  }

  // Calculate streak percentile (mock data - would come from backend)
  const mockPercentile = 80;

  const chartConfig = {
    activity: {
      label: "Activity",
      theme: {
        light: "#8B5CF6",
        dark: "#8B5CF6",
      },
    },
    visits: {
      label: "Visits",
      theme: {
        light: "#1D4ED8",
        dark: "#3B82F6",
      },
    },
  };

  // Calculate the percentage for the progress bar
  const streakPercentage = streak.longest > 0 
    ? Math.min(100, (streak.current / streak.longest) * 100) 
    : 0;

  return (
    <div className="grid gap-6">
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
                Top {100 - mockPercentile}% of users
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-talkstream-purple" />
                <span className="text-2xl font-bold">{stats.timeInRooms}</span>
                <span className="text-muted-foreground">minutes</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.roomsJoined} rooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.messagesPosted} msgs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="pt-6">
        <div className="px-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Activity & Content Log</h3>
            <p className="text-sm text-muted-foreground">
              Track your activity and maintain accountability
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="mt-6">
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search activity logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice(0, 5).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.source}</TableCell>
                          <TableCell>
                            {format(new Date(log.visitTimestamp), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>{formatDuration(log.duration)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Award className="h-4 w-4" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">First Week</Badge>
                          <span className="text-sm text-muted-foreground">7 days clean</span>
                        </div>
                        {streak.current >= 7 && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Rising Star</Badge>
                          <span className="text-sm text-muted-foreground">30 days clean</span>
                        </div>
                        {streak.current >= 30 && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Champion</Badge>
                          <span className="text-sm text-muted-foreground">90 days clean</span>
                        </div>
                        {streak.current >= 90 && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
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
                          <YAxis tickFormatter={(value) => `${value}m`} />
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
                    <CardTitle className="text-base">Recent Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Current Streak Started</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(new Date().getTime() - streak.current * 24 * 60 * 60 * 1000),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Progress Summary</p>
                          <p className="text-sm text-muted-foreground">
                            {streak.current === streak.longest
                              ? "You're at your personal best!"
                              : `${streak.longest - streak.current} days to beat your record`}
                          </p>
                        </div>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Community Standing</p>
                          <p className="text-sm text-muted-foreground">
                            Top {100 - mockPercentile}% of active users
                          </p>
                        </div>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
