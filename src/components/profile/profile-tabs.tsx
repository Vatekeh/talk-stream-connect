
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCombinedStats } from "./profile-combined-stats";
import { ProfileSaves } from "./profile-saves";
import { ProfileClips } from "./profile-clips";
import { Save, Clip, NsfwContentLog, NsfwUserInsights, UserStats, UserStreak } from "@/types";
import { Loader } from "lucide-react";

interface ProfileTabsProps {
  stats: UserStats;
  nsfwLogs: NsfwContentLog[];
  nsfwInsights: NsfwUserInsights | null;
  streak: UserStreak;
  saves: Save[];
  clips: Clip[];
  logsLoading?: boolean;
  insightsLoading?: boolean;
}

export function ProfileTabs({ 
  stats, 
  nsfwLogs, 
  nsfwInsights, 
  streak, 
  saves, 
  clips,
  logsLoading = false,
  insightsLoading = false
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="saves">Saves</TabsTrigger>
        <TabsTrigger value="clips">Clips</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <ProfileCombinedStats 
          stats={stats} 
          streak={streak}
          logsLoading={logsLoading}
          insightsLoading={insightsLoading}
        />
      </TabsContent>
      
      <TabsContent value="saves">
        <ProfileSaves saves={saves} />
      </TabsContent>
      
      <TabsContent value="clips">
        <ProfileClips clips={clips} />
      </TabsContent>
      
      <TabsContent value="activity">
        <ProfileCombinedStats 
          stats={stats}
          streak={streak}
          logsLoading={logsLoading}
          insightsLoading={insightsLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
