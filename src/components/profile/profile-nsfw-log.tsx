
import { useState } from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Clock, 
  ExternalLink, 
  Eye, 
  Filter, 
  Link as LinkIcon, 
  PieChart as PieChartIcon, 
  Search, 
  Settings, 
  Shield, 
  BarChart as BarChartIcon,
  Calendar 
} from "lucide-react";
import { NsfwContentLog, NsfwUserInsights } from "@/types";

interface ProfileNsfwLogProps {
  logs: NsfwContentLog[];
  insights: NsfwUserInsights;
}

export function ProfileNsfwLog({ logs, insights }: ProfileNsfwLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("logs");
  
  const filteredLogs = logs.filter(log => 
    log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  const chartConfig = {
    visits: {
      label: "Visits",
      theme: {
        light: "#1D4ED8",
        dark: "#3B82F6",
      },
    },
    duration: {
      label: "Duration",
      theme: {
        light: "#8B5CF6",
        dark: "#A78BFA",
      },
    },
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Transform time patterns data for the heatmap
  const timePatternsByDay = insights.timePatterns.reduce((acc, pattern) => {
    const day = daysOfWeek[pattern.dayOfWeek];
    const hour = pattern.hour;
    
    if (!acc[day]) {
      acc[day] = Array(24).fill(0);
    }
    
    acc[day][hour] = pattern.visitCount;
    return acc;
  }, {} as Record<string, number[]>);
  
  const pieChartData = insights.topSources.map(source => ({
    name: source.source,
    value: source.visitCount
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>NSFW Content Log & Metadata</CardTitle>
              <CardDescription>
                Track and analyze your NSFW content browsing patterns
              </CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Settings size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="logs" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="logs">Content Log</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search logs..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter size={18} />
                  </Button>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Page Title</TableHead>
                        <TableHead>Visit Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.source}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={log.pageTitle}>
                              {log.pageTitle}
                            </TableCell>
                            <TableCell>
                              {format(new Date(log.visitTimestamp), "MMM d, yyyy h:mm a")}
                            </TableCell>
                            <TableCell>{formatDuration(log.duration)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {log.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <LinkIcon size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No logs found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sources">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top Sources</CardTitle>
                    <CardDescription>
                      Most frequently visited sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} visits`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Source Details</CardTitle>
                    <CardDescription>
                      Activity breakdown by source
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.topSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between pb-2 border-b last:border-0">
                          <div className="space-y-1">
                            <div className="font-medium">{source.source}</div>
                            <div className="text-sm text-muted-foreground">
                              Last visit: {format(new Date(source.lastVisit), "MMM d, yyyy")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{source.visitCount} visits</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDuration(source.totalDuration)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="patterns">
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
                      <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                      >
                        <BarChart data={insights.timePatterns.slice(0, 24)}>
                          <XAxis 
                            dataKey="hour" 
                            tickFormatter={(value) => `${value}:00`}
                          />
                          <YAxis />
                          <ChartTooltip 
                            content={
                              <ChartTooltipContent 
                                formatter={(value) => `${value} visits`}
                              />
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
                      <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                      >
                        <BarChart 
                          data={
                            daysOfWeek.map((day, index) => ({
                              day,
                              visits: insights.timePatterns
                                .filter(p => p.dayOfWeek === index)
                                .reduce((sum, p) => sum + p.visitCount, 0)
                            }))
                          }
                        >
                          <XAxis dataKey="day" />
                          <YAxis />
                          <ChartTooltip 
                            content={
                              <ChartTooltipContent 
                                formatter={(value) => `${value} visits`}
                              />
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
            </TabsContent>
            
            <TabsContent value="insights">
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
                      <span className="text-2xl font-bold">{insights.totalVisits}</span>
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
                      <span className="text-2xl font-bold">{formatDuration(insights.totalDuration)}</span>
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
                      <span className="text-2xl font-bold">{formatDuration(insights.averageDuration)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
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
                        <li className="flex gap-2">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                          <span>Your peak browsing time is between {insights.timePatterns[0]?.hour}:00 - {insights.timePatterns[0]?.hour + 1}:00. Consider scheduling alternative activities during this time.</span>
                        </li>
                        <li className="flex gap-2">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                          <span>Set up time limits for your most visited source: {insights.topSources[0]?.source}.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
