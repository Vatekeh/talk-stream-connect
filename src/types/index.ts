
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isModerator?: boolean;
  isSpeaker?: boolean;
  isMuted?: boolean;
  isHandRaised?: boolean;
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
