
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCombinedStats } from "./profile-combined-stats";
import { ProfileSaves } from "./profile-saves";
import { ProfileClips } from "./profile-clips";
import { Save, Clip, NsfwContentLog, NsfwUserInsights, UserStats, UserStreak } from "@/types";

interface ProfileTabsProps {
  stats: UserStats;
  nsfwLogs: NsfwContentLog[];
  nsfwInsights: NsfwUserInsights;
  streak: UserStreak;
  saves: Save[];
  clips: Clip[];
}

export function ProfileTabs({ 
  stats, 
  nsfwLogs, 
  nsfwInsights, 
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
