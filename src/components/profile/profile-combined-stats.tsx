
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Search, Settings } from "lucide-react";
import { NsfwContentLog, NsfwUserInsights, UserStats, UserStreak } from "@/types";
import { ContentLogTable } from "./log/content-log-table";
import { StreakOverview } from "./stats/streak-overview";
import { ActivityPatterns } from "./stats/activity-patterns";

interface ProfileCombinedStatsProps {
  stats: UserStats;
  streak: UserStreak;
  nsfwLogs?: NsfwContentLog[];
  nsfwInsights?: NsfwUserInsights;
}

export function ProfileCombinedStats({ 
  stats, 
  nsfwLogs = [], // Default to empty array
  nsfwInsights = {
    topSources: [],
    recentLogs: [],
    timePatterns: [],
    totalVisits: 0,
    totalDuration: 0,
    averageDuration: 0
  }, // Default object with empty values
  streak 
}: ProfileCombinedStatsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("logs");
  
  const filteredLogs = nsfwLogs.filter(log => 
    log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.pageTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.url?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <StreakOverview streak={streak} />
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
                
                <ContentLogTable logs={filteredLogs} />
              </div>
            </TabsContent>
            
            <TabsContent value="patterns">
              {nsfwInsights?.timePatterns && nsfwInsights.timePatterns.length > 0 ? (
                <ActivityPatterns timePatterns={nsfwInsights.timePatterns} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Pattern Data</CardTitle>
                    <CardDescription>
                      No activity pattern data is available at this time
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="insights">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Insights Coming Soon</CardTitle>
                    <CardDescription>
                      Detailed insights and recommendations will be available in a future update
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
