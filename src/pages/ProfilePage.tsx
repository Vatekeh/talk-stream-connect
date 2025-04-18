import { AppHeader } from "@/components/layout/app-header";
import { UserProfileHeader } from "@/components/profile/user-profile-header";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { User, Save, Clip, NsfwContentLog, NsfwUserInsights, UserStats, UserStreak } from "@/types";

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

// Mock data for NSFW content logs
const mockNsfwLogs: NsfwContentLog[] = [
  {
    id: "1",
    userId: "1",
    source: "Reddit",
    pageTitle: "r/NSFW_Content_Discussion",
    url: "https://reddit.com/r/NSFW_Content_Discussion",
    visitTimestamp: "2023-04-16T21:30:00Z",
    duration: 480, // 8 minutes
    category: "text",
    tags: ["discussion", "forum"]
  },
  {
    id: "2",
    userId: "1",
    source: "ImgurNSFW",
    pageTitle: "NSFW Image Gallery",
    url: "https://imgur.com/nsfw/gallery",
    visitTimestamp: "2023-04-15T22:15:00Z",
    duration: 720, // 12 minutes
    category: "image",
    tags: ["gallery", "images"]
  },
  {
    id: "3",
    userId: "1",
    source: "NSFWVideoSite",
    pageTitle: "Video Content",
    url: "https://example.com/nsfw-videos",
    visitTimestamp: "2023-04-14T23:10:00Z",
    duration: 960, // 16 minutes
    category: "video",
    tags: ["video", "streaming"]
  },
  {
    id: "4",
    userId: "1",
    source: "Reddit",
    pageTitle: "r/Another_NSFW_Subreddit",
    url: "https://reddit.com/r/Another_NSFW_Subreddit",
    visitTimestamp: "2023-04-13T20:45:00Z",
    duration: 540, // 9 minutes
    category: "text",
    tags: ["discussion", "forum"]
  },
  {
    id: "5",
    userId: "1",
    source: "AdultContentSite",
    pageTitle: "Mixed Content Page",
    url: "https://example.com/adult-content",
    visitTimestamp: "2023-04-12T21:30:00Z",
    duration: 840, // 14 minutes
    category: "other",
    tags: ["mixed", "content"]
  }
];

// Create mock source summaries
const mockSourceSummaries: any[] = [
  {
    source: "Reddit",
    visitCount: 15,
    totalDuration: 7200, // 120 minutes
    lastVisit: "2023-04-16T21:30:00Z"
  },
  {
    source: "ImgurNSFW",
    visitCount: 8,
    totalDuration: 5400, // 90 minutes
    lastVisit: "2023-04-15T22:15:00Z"
  },
  {
    source: "NSFWVideoSite",
    visitCount: 5,
    totalDuration: 4800, // 80 minutes
    lastVisit: "2023-04-14T23:10:00Z"
  },
  {
    source: "AdultContentSite",
    visitCount: 3,
    totalDuration: 2520, // 42 minutes
    lastVisit: "2023-04-12T21:30:00Z"
  }
];

// Create mock time patterns
const mockTimePatterns: any[] = [
  { hour: 21, dayOfWeek: 2, visitCount: 12 },
  { hour: 22, dayOfWeek: 2, visitCount: 18 },
  { hour: 23, dayOfWeek: 2, visitCount: 22 },
  { hour: 0, dayOfWeek: 3, visitCount: 15 },
  { hour: 21, dayOfWeek: 3, visitCount: 10 },
  { hour: 22, dayOfWeek: 3, visitCount: 16 },
  { hour: 23, dayOfWeek: 3, visitCount: 20 },
  { hour: 0, dayOfWeek: 4, visitCount: 12 },
  { hour: 21, dayOfWeek: 4, visitCount: 8 },
  { hour: 22, dayOfWeek: 4, visitCount: 14 },
  { hour: 23, dayOfWeek: 4, visitCount: 17 },
  { hour: 0, dayOfWeek: 5, visitCount: 11 },
  { hour: 21, dayOfWeek: 5, visitCount: 14 },
  { hour: 22, dayOfWeek: 5, visitCount: 24 },
  { hour: 23, dayOfWeek: 5, visitCount: 26 },
  { hour: 0, dayOfWeek: 6, visitCount: 18 },
  { hour: 21, dayOfWeek: 6, visitCount: 12 },
  { hour: 22, dayOfWeek: 6, visitCount: 22 },
  { hour: 23, dayOfWeek: 6, visitCount: 28 },
  { hour: 0, dayOfWeek: 0, visitCount: 19 },
  { hour: 21, dayOfWeek: 0, visitCount: 10 },
  { hour: 22, dayOfWeek: 0, visitCount: 16 },
  { hour: 23, dayOfWeek: 0, visitCount: 19 },
  { hour: 0, dayOfWeek: 1, visitCount: 14 }
];

// Create mock user insights
const mockNsfwInsights: any = {
  topSources: mockSourceSummaries,
  recentLogs: mockNsfwLogs.slice(0, 3),
  timePatterns: mockTimePatterns,
  totalVisits: 31,
  totalDuration: 19920, // 332 minutes
  averageDuration: 642 // 10.7 minutes per visit
};

function ProfilePageContent() {
  const { user, setUser, isEditProfileOpen, setIsEditProfileOpen } = useProfile();

  const handleUpdateProfile = (updatedUser: User) => {
    setUser({ ...user, ...updatedUser });
    setIsEditProfileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={true} 
        userName={user.name} 
        userAvatar={user.avatar} 
        isModerator={user.isModerator} 
      />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <UserProfileHeader 
            user={user} 
            onEditProfile={() => setIsEditProfileOpen(true)} 
          />
          
          <ProfileTabs 
            stats={mockStats}
            nsfwLogs={mockNsfwLogs}
            nsfwInsights={mockNsfwInsights}
            streak={mockStreak}
            saves={mockSaves}
            clips={mockClips}
          />
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

export default function ProfilePage() {
  return (
    <ProfileProvider>
      <ProfilePageContent />
    </ProfileProvider>
  );
}
