
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isModerator?: boolean;
  isSpeaker?: boolean;
  isMuted?: boolean;
  isHandRaised?: boolean;
  isCreator?: boolean; // Added is creator flag
  pronouns?: string; // Explicitly marked as optional
  bio?: string;
  createdAt?: string;
  lastActive?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isModerator?: boolean;
  isSystem?: boolean; // Added to support system messages
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  creatorId?: string; // Added creator ID
  hostName: string;
  hostAvatar?: string;
  speakers: User[];
  participants: User[];
  isLive: boolean;
  createdAt: string;
  topic?: string;
}

export interface Alert {
  id: string;
  roomId: string;
  userId: string;
  type: "nsfw" | "harassment" | "spam" | "other";
  content: string;
  timestamp: string;
  isResolved: boolean;
}

export interface UserStreak {
  current: number;
  longest: number;
  lastUpdated: string;
}

export interface Save {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  message?: string;
  timestamp: string;
}

export interface Clip {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  title: string;
  description?: string;
  duration: number;
  timestamp: string;
  thumbnailUrl?: string;
}

export interface UserStats {
  timeInRooms: number; // in minutes
  roomsJoined: number;
  messagesPosted: number;
  weeklyActivity: { date: string; duration: number }[];
  monthlyActivity: { date: string; duration: number }[];
}

export interface NsfwContentLog {
  id: string;
  userId: string;
  source: string;
  pageTitle: string;
  url: string;
  visitTimestamp: string;
  duration: number; // in seconds
  category: "image" | "video" | "text" | "other";
  tags: string[];
}

// Adding the missing interfaces:
export interface NsfwSourceSummary {
  source: string;
  visitCount: number;
  totalDuration: number; // in seconds
  lastVisit: string;
}

export interface NsfwTimePattern {
  hour: number;
  dayOfWeek: number;
  visitCount: number;
}

export interface NsfwUserInsights {
  topSources: NsfwSourceSummary[];
  recentLogs: NsfwContentLog[];
  timePatterns: NsfwTimePattern[];
  totalVisits: number;
  totalDuration: number; // in seconds
  averageDuration: number; // in seconds
}
