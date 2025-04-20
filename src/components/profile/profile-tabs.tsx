
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCombinedStats } from "./profile-combined-stats";
import { ProfileSaves } from "./profile-saves";
import { ProfileClips } from "./profile-clips";
import { Save, Clip, NsfwContentLog, NsfwUserInsights, UserStats, UserStreak } from "@/types";

interface ProfileTabsProps {
  stats: UserStats;
  saves: Save[];
  clips: Clip[];
  streak: UserStreak;
  nsfwLogs?: NsfwContentLog[]; // Make optional
  nsfwInsights?: NsfwUserInsights; // Make optional
}

export function ProfileTabs({ 
  stats, 
  nsfwLogs = [], // Provide default value
  nsfwInsights = {
    topSources: [],
    recentLogs: [],
    timePatterns: [],
    totalVisits: 0,
    totalDuration: 0,
    averageDuration: 0
  }, // Provide default value
  streak, 
  saves, 
  clips 
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
          nsfwLogs={nsfwLogs}
          nsfwInsights={nsfwInsights}
          streak={streak}
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
          nsfwLogs={nsfwLogs}
          nsfwInsights={nsfwInsights}
          streak={streak}
        />
      </TabsContent>
    </Tabs>
  );
}
