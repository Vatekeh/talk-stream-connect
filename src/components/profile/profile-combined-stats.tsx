import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Search, Settings, Loader } from "lucide-react";
import { UserStats, UserStreak } from "@/types";
import { ContentLogTable } from "./log/content-log-table";
import { StreakOverview } from "./stats/streak-overview";
import { ActivityPatterns } from "./stats/activity-patterns";
import { useDetectionLogs } from "@/hooks/useDetectionLogs";
import { useDetectionInsights } from "@/hooks/useDetectionInsights";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileCombinedStatsProps {
  stats: UserStats;
  streak: UserStreak;
  logsLoading?: boolean;
  insightsLoading?: boolean;
}

export function ProfileCombinedStats({ 
  stats, 
  streak,
  logsLoading = false,
  insightsLoading = false
}: ProfileCombinedStatsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  
  const { logs, loading: fetchLogsLoading, error: logsError } = useDetectionLogs({
    userId: user?.id
  });
  
  const { insights, loading: fetchInsightsLoading } = useDetectionInsights({
    logs,
    loading: fetchLogsLoading
  });
  
  // Use passed loading states if available, otherwise use fetched loading states
  const isLogsLoading = logsLoading || fetchLogsLoading;
  const isInsightsLoading = insightsLoading || fetchInsightsLoading;
  
  const filteredLogs = logs.filter(log => 
    (log.source?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (log.pageTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (log.url?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const renderLoading = () => (
    <div className="flex justify-center items-center p-12">
      <Loader className="h-8 w-8 animate-spin mr-2" />
      <p className="text-muted-foreground">Loading data...</p>
    </div>
  );

  const renderError = (error: string) => (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
      <p className="mb-2">Error loading data: {error}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2" 
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
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
          <Tabs 
            defaultValue="overview" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Content Log</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {isLogsLoading ? (
                renderLoading()
              ) : logsError ? (
                renderError(logsError)
              ) : (
                <StreakOverview streak={streak} />
              )}
            </TabsContent>
            
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
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                
                {logsError && renderError(logsError)}
                {isLogsLoading ? (
                  renderLoading()
                ) : filteredLogs.length > 0 ? (
                  <ContentLogTable logs={filteredLogs} />
                ) : (
                  <div className="text-center p-12 border rounded-md bg-background">
                    <p className="text-muted-foreground mb-2">No content logs found</p>
                    <p className="text-sm text-muted-foreground">
                      Content detection data will appear here when you use the Chrome extension.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="patterns">
              {isInsightsLoading ? (
                renderLoading()
              ) : logsError ? (
                renderError(logsError)
              ) : insights && insights.timePatterns.some(p => p.visitCount > 0) ? (
                <ActivityPatterns timePatterns={insights.timePatterns} />
              ) : (
                <div className="text-center p-12 border rounded-md bg-background">
                  <p className="text-muted-foreground mb-2">No pattern data available</p>
                  <p className="text-sm text-muted-foreground">
                    Usage patterns will be visualized here once you have more detection data.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="insights">
              {isInsightsLoading ? (
                renderLoading()
              ) : logsError ? (
                renderError(logsError)
              ) : insights ? (
                <div className="space-y-4">
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
                          <p className="text-sm text-muted-foreground">Total visits</p>
                          <p className="text-2xl font-bold">{insights.totalVisits}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Top source</p>
                          <p className="text-2xl font-bold">
                            {insights.topSources.length > 0 
                              ? insights.topSources[0].source 
                              : 'None'}
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Average duration</p>
                          <p className="text-2xl font-bold">
                            {formatSeconds(insights.averageDuration)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center p-12 border rounded-md bg-background">
                  <p className="text-muted-foreground mb-2">No insights available</p>
                  <p className="text-sm text-muted-foreground">
                    Content insights will be generated once you have more detection data.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format seconds into a readable duration
function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}
