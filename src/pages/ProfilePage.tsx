
import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { UserProfileHeader } from "@/components/profile/user-profile-header";
import { ProfileStreaks } from "@/components/profile/profile-streaks";
import { ProfileSaves } from "@/components/profile/profile-saves";
import { ProfileClips } from "@/components/profile/profile-clips";
import { ProfileStats } from "@/components/profile/profile-stats";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clip, Save, User, UserStats, UserStreak } from "@/types";

// Mock data - this would come from Supabase in a real app
const mockUser: User = {
  id: "1",
  name: "Alex Johnson",
  avatar: "/placeholder.svg",
  pronouns: "they/them",
  bio: "Passionate about technology and connecting with like-minded individuals.",
  createdAt: "2023-01-15T12:00:00Z",
  lastActive: "2023-04-17T14:30:00Z",
  isModerator: true
};

const mockStreak: UserStreak = {
  current: 7,
  longest: 14,
  lastUpdated: "2023-04-16T23:59:59Z"
};

const mockSaves: Save[] = [
  {
    id: "1",
    fromUserId: "2",
    fromUserName: "Taylor Swift",
    fromUserAvatar: "/placeholder.svg",
    toUserId: "1",
    message: "Helped me understand complex topics with patience",
    timestamp: "2023-04-15T15:30:00Z"
  },
  {
    id: "2",
    fromUserId: "3",
    fromUserName: "Sam Smith",
    fromUserAvatar: "/placeholder.svg",
    toUserId: "1",
    message: "Great advice on career development",
    timestamp: "2023-04-10T12:15:00Z"
  }
];

const mockClips: Clip[] = [
  {
    id: "1",
    userId: "1",
    roomId: "101",
    roomName: "Tech Talks: AI Revolution",
    title: "Insights on GPT-4 capabilities",
    description: "A fascinating discussion about the limits of AI language models",
    duration: 120, // in seconds
    timestamp: "2023-04-14T18:20:00Z"
  },
  {
    id: "2",
    userId: "1",
    roomId: "102",
    roomName: "Career Growth in Tech",
    title: "Navigating job interviews",
    description: "Tips for technical interviews in big tech companies",
    duration: 180, // in seconds
    timestamp: "2023-04-05T11:45:00Z"
  }
];

const mockStats: UserStats = {
  timeInRooms: 320, // in minutes
  roomsJoined: 15,
  messagesPosted: 47,
  weeklyActivity: [
    { date: "2023-04-11", duration: 45 },
    { date: "2023-04-12", duration: 30 },
    { date: "2023-04-13", duration: 60 },
    { date: "2023-04-14", duration: 75 },
    { date: "2023-04-15", duration: 45 },
    { date: "2023-04-16", duration: 20 },
    { date: "2023-04-17", duration: 45 }
  ],
  monthlyActivity: [
    { date: "2023-03-17", duration: 220 },
    { date: "2023-03-24", duration: 180 },
    { date: "2023-03-31", duration: 240 },
    { date: "2023-04-07", duration: 300 },
    { date: "2023-04-14", duration: 255 },
    { date: "2023-04-17", duration: 65 }
  ]
};

export default function ProfilePage() {
  const [user, setUser] = useState<User>(mockUser);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleUpdateProfile = (updatedUser: User) => {
    setUser({ ...user, ...updatedUser });
    setIsEditProfileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={true} userName={user.name} userAvatar={user.avatar} isModerator={user.isModerator} />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <UserProfileHeader 
            user={user} 
            onEditProfile={() => setIsEditProfileOpen(true)} 
          />
          
          <Tabs defaultValue="streaks" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="streaks">Streaks</TabsTrigger>
              <TabsTrigger value="saves">Saves</TabsTrigger>
              <TabsTrigger value="clips">Clips</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="streaks">
              <ProfileStreaks streak={mockStreak} />
            </TabsContent>
            
            <TabsContent value="saves">
              <ProfileSaves saves={mockSaves} />
            </TabsContent>
            
            <TabsContent value="clips">
              <ProfileClips clips={mockClips} />
            </TabsContent>
            
            <TabsContent value="stats">
              <ProfileStats stats={mockStats} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <EditProfileDialog 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}
