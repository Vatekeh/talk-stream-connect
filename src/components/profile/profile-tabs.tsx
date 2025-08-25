import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileStats } from "./profile-stats";
import { ProfileStreaks } from "./profile-streaks";
import { ProfileNsfwLog } from "./profile-nsfw-log";
import { ProfileSaves } from "./profile-saves";
import { ProfileClips } from "./profile-clips";
import { AnalyticsUpgradePrompt } from "./analytics-upgrade-prompt";
import { useAuth } from "@/contexts/auth";

interface ProfileTabsProps {
  stats: any;
  streak: any;
  nsfwLogs: any[];
  nsfwInsights: any;
  saves: any[];
  clips: any[];
  logsLoading?: boolean;
  insightsLoading?: boolean;
}

export function ProfileTabs({
  stats,
  streak,
  nsfwLogs,
  nsfwInsights,
  saves,
  clips,
  logsLoading,
  insightsLoading
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("stats");
  const { isSubscribed } = useAuth();

  return (
    <Tabs defaultValue="stats" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="streaks">Streaks</TabsTrigger>
        <TabsTrigger value="nsfw">Content Log</TabsTrigger>
        <TabsTrigger value="saves">Saves</TabsTrigger>
        <TabsTrigger value="clips">Clips</TabsTrigger>
      </TabsList>
      
      <TabsContent value="stats" className="space-y-6">
        {isSubscribed ? (
          <ProfileStats stats={stats} loading={logsLoading || insightsLoading} />
        ) : (
          <AnalyticsUpgradePrompt />
        )}
      </TabsContent>
      
      <TabsContent value="streaks">
        <div className="space-y-6">
          {isSubscribed ? (
            <ProfileStreaks streak={streak} loading={logsLoading || insightsLoading} />
          ) : (
            <AnalyticsUpgradePrompt />
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="nsfw">
        <ProfileNsfwLog 
          logs={nsfwLogs}
          insights={nsfwInsights}
          loading={logsLoading || insightsLoading}
          isSubscribed={isSubscribed}
        />
      </TabsContent>
      
      <TabsContent value="saves">
        <ProfileSaves saves={saves} />
      </TabsContent>
      
      <TabsContent value="clips">
        <ProfileClips clips={clips} />
      </TabsContent>
    </Tabs>
  );
}
