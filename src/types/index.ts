
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isModerator?: boolean;
  isSpeaker?: boolean;
  isMuted?: boolean;
  isHandRaised?: boolean;
  pronouns?: string;
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
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  hostId: string;
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
