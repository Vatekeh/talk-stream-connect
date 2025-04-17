
import { Room, User, Message } from "@/types";

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=8B5CF6&color=fff",
    isModerator: true,
    isSpeaker: true,
  },
  {
    id: "2",
    name: "Priya Singh",
    avatar: "https://ui-avatars.com/api/?name=Priya+Singh&background=8B5CF6&color=fff",
    isSpeaker: true,
    isMuted: true,
  },
  {
    id: "3",
    name: "Michael Chen",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=8B5CF6&color=fff",
    isSpeaker: true,
  },
  {
    id: "4",
    name: "Olivia Davis",
    avatar: "https://ui-avatars.com/api/?name=Olivia+Davis&background=8B5CF6&color=fff",
    isHandRaised: true,
  },
  {
    id: "5",
    name: "Carlos Rodriguez",
    avatar: "https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=8B5CF6&color=fff",
  },
  {
    id: "6",
    name: "Taylor Kim",
    avatar: "https://ui-avatars.com/api/?name=Taylor+Kim&background=8B5CF6&color=fff",
  },
  {
    id: "7",
    name: "Jordan Smith",
    avatar: "https://ui-avatars.com/api/?name=Jordan+Smith&background=8B5CF6&color=fff",
  },
  {
    id: "8",
    name: "Emma Wilson",
    avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=8B5CF6&color=fff",
  },
];

// Mock rooms
export const mockRooms: Room[] = [
  {
    id: "1",
    name: "Tech Trends 2025",
    description: "Discussing the future of technology and emerging trends",
    hostId: "1",
    hostName: "Alex Johnson",
    hostAvatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=8B5CF6&color=fff",
    speakers: mockUsers.filter(user => user.isSpeaker).slice(0, 3),
    participants: mockUsers.slice(3, 7),
    isLive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    topic: "Technology",
  },
  {
    id: "2",
    name: "Startup Funding Strategies",
    description: "Learn how to secure funding for your startup",
    hostId: "2",
    hostName: "Priya Singh",
    hostAvatar: "https://ui-avatars.com/api/?name=Priya+Singh&background=8B5CF6&color=fff",
    speakers: [mockUsers[1], mockUsers[3]],
    participants: [mockUsers[4], mockUsers[5]],
    isLive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    topic: "Business",
  },
  {
    id: "3",
    name: "AI in Healthcare",
    description: "Exploring how artificial intelligence is transforming healthcare",
    hostId: "3",
    hostName: "Michael Chen",
    hostAvatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=8B5CF6&color=fff",
    speakers: [mockUsers[2]],
    participants: [mockUsers[6], mockUsers[7]],
    isLive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    topic: "Healthcare",
  },
];

// Mock messages
export const mockMessages: Message[] = [
  {
    id: "1",
    userId: "5",
    userName: "Carlos Rodriguez",
    userAvatar: "https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=8B5CF6&color=fff",
    content: "Has anyone implemented AI in a clinical setting?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    userId: "1",
    userName: "Alex Johnson",
    userAvatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=8B5CF6&color=fff",
    content: "Great question! We'll discuss that in the next segment.",
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    isModerator: true,
  },
  {
    id: "3",
    userId: "7",
    userName: "Jordan Smith",
    userAvatar: "https://ui-avatars.com/api/?name=Jordan+Smith&background=8B5CF6&color=fff",
    content: "I'm working on a project using ML for diagnostic imaging",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "4",
    userId: "8",
    userName: "Emma Wilson",
    userAvatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=8B5CF6&color=fff",
    content: "Looking forward to the discussion on regulatory challenges",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "5",
    userId: "3",
    userName: "Michael Chen",
    userAvatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=8B5CF6&color=fff",
    content: "We'll be taking questions about implementation in 10 minutes",
    timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    isModerator: true,
  },
];
