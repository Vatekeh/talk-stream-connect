import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContentLogTable } from "./log/content-log-table";
import { ProfileCombinedStats } from "./profile-combined-stats";
import { AnalyticsUpgradePrompt } from "./analytics-upgrade-prompt";

// Update interface to include isSubscribed
interface ProfileNsfwLogProps {
  logs: any[];
  insights: any;
  loading: boolean;
  isSubscribed: boolean; // Added this prop
}

export function ProfileNsfwLog({ logs, insights, loading, isSubscribed }: ProfileNsfwLogProps) {
  // Only show limited data for free users (basic logs, but not insights)
  return (
    <div className="space-y-6">
      {/* Basic content log - available to all users */}
      <Card>
        <CardHeader>
          <CardTitle>Content Detection Log</CardTitle>
          <CardDescription>
            Recent content detection events from your activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <ContentLogTable logs={logs} />
          ) : (
            <div className="text-center p-12 border rounded-md bg-background">
              <p className="text-muted-foreground mb-2">No content logs found</p>
              <p className="text-sm text-muted-foreground">
                Content detection data will appear here when you use the Chrome extension.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Insights and advanced analytics - only for subscribed users */}
      {isSubscribed ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Detection Insights</CardTitle>
              <CardDescription>
                Analysis of your content detection patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights ? (
                <div className="space-y-4">
                  <p>Total Visits: {insights.totalVisits}</p>
                  <p>Total Duration: {insights.totalDuration}</p>
                  <p>Average Duration: {insights.averageDuration}</p>
                </div>
              ) : (
                <p>No insights available.</p>
              )}
            </CardContent>
          </Card>
          
          <ProfileCombinedStats 
            stats={insights?.stats || {}} 
            streak={insights?.streak || {}} 
            logsLoading={loading} 
            insightsLoading={loading}
          />
        </>
      ) : (
        <AnalyticsUpgradePrompt />
      )}
    </div>
  );
}
