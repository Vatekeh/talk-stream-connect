
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Search, Settings } from "lucide-react";
import { NsfwContentLog, NsfwUserInsights } from "@/types";
import { ContentLogTable } from "./log/content-log-table";
import { ActivityPatterns } from "./stats/activity-patterns";
import { TopSources } from "./nsfw/top-sources";
import { InsightsOverview } from "./nsfw/insights-overview";
import { SafetyRecommendations } from "./nsfw/safety-recommendations";

interface ProfileNsfwLogProps {
  logs: NsfwContentLog[];
  insights: NsfwUserInsights;
}

export function ProfileNsfwLog({ logs, insights }: ProfileNsfwLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("logs");
  
  const filteredLogs = logs.filter(log => 
    log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.pageTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <ContentLogTable logs={filteredLogs} />
              </div>
            </TabsContent>
            
            <TabsContent value="sources">
              <TopSources sources={insights.topSources} />
            </TabsContent>
            
            <TabsContent value="patterns">
              {insights.timePatterns && insights.timePatterns.length > 0 ? (
                <ActivityPatterns timePatterns={insights.timePatterns} />
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
              <div className="space-y-6">
                <InsightsOverview
                  totalVisits={insights.totalVisits}
                  totalDuration={insights.totalDuration}
                  averageDuration={insights.averageDuration}
                />
                <SafetyRecommendations
                  timePatterns={insights.timePatterns}
                  topSources={insights.topSources}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
