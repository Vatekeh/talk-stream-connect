
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { RoomChat } from "@/components/room/room-chat";
import { ParticipantList } from "@/components/room/participant-list";
import { RoomControls } from "@/components/room/room-controls";
import { mockRooms, mockMessages } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgePulse } from "@/components/ui/badge-pulse";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users } from "lucide-react";
import { Room } from "@/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Link } from "react-router-dom";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [isChatOpen, setIsChatOpen] = useState(!isMobile);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(!isMobile);
  
  // This would be replaced with actual Supabase query
  const room = mockRooms.find(r => r.id === roomId) || {
    id: roomId || "new",
    name: "New Room",
    hostId: "1",
    hostName: "Alex Johnson",
    hostAvatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=8B5CF6&color=fff",
    speakers: [],
    participants: [],
    isLive: true,
    createdAt: new Date().toISOString(),
  } as Room;
  
  const toggleChat = () => {
    if (isMobile) {
      setIsChatOpen(!isChatOpen);
      setIsParticipantsOpen(false);
    } else {
      setIsChatOpen(!isChatOpen);
    }
  };
  
  const toggleParticipants = () => {
    if (isMobile) {
      setIsParticipantsOpen(!isParticipantsOpen);
      setIsChatOpen(false);
    } else {
      setIsParticipantsOpen(!isParticipantsOpen);
    }
  };
  
  const handleLeaveRoom = () => {
    // This would be replaced with actual Supabase functionality
    navigate("/");
  };
  
  const participantCount = room.speakers.length + room.participants.length;
  
  // Set document title
  useEffect(() => {
    document.title = `${room.name} | TalkStream`;
    return () => {
      document.title = "TalkStream";
    };
  }, [room.name]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={true} userName="Alex Johnson" isModerator={true} />
      
      <main className="flex-1 container flex flex-col py-4">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="gap-1 mb-2">
            <Link to="/">
              <ChevronLeft size={16} />
              Back to Rooms
            </Link>
          </Button>
          
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BadgePulse color="purple">LIVE</BadgePulse>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users size={14} className="mr-1" />
                  {participantCount} Participants
                </div>
              </div>
              
              <h1 className="text-2xl font-bold">{room.name}</h1>
              {room.description && <p className="text-muted-foreground">{room.description}</p>}
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={room.hostAvatar} alt={room.hostName} />
                <AvatarFallback className="bg-talkstream-purple text-white">
                  {room.hostName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{room.hostName}</p>
                <p className="text-xs text-muted-foreground">Host</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <div className={`md:col-span-2 lg:col-span-3 flex flex-col rounded-xl bg-accent p-4 ${isMobile && (isChatOpen || isParticipantsOpen) ? 'hidden' : ''}`}>
            <div className="flex-1 flex items-center justify-center">
              {/* This is where the audio visualization would go */}
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">Audio Room</h2>
                <p className="text-muted-foreground">
                  Audio functionality would be implemented with Supabase Realtime.
                </p>
              </div>
            </div>
          </div>
          
          {/* Mobile: Show either chat or participants, but not both */}
          {isMobile ? (
            <>
              {isChatOpen && (
                <div className="h-[calc(100vh-300px)]">
                  <RoomChat roomId={room.id} messages={mockMessages} />
                </div>
              )}
              
              {isParticipantsOpen && (
                <div className="h-[calc(100vh-300px)]">
                  <ParticipantList 
                    speakers={room.speakers} 
                    participants={room.participants} 
                    hostId={room.hostId}
                    currentUser={mockRooms[0].speakers[0]} // Mock current user
                  />
                </div>
              )}
            </>
          ) : (
            // Desktop: Show both based on toggle state
            <>
              {isChatOpen && (
                <div className="h-[calc(100vh-300px)]">
                  <RoomChat roomId={room.id} messages={mockMessages} />
                </div>
              )}
              
              {isParticipantsOpen && (
                <div className={`h-[calc(100vh-300px)] ${isChatOpen ? 'hidden lg:block' : ''}`}>
                  <ParticipantList 
                    speakers={room.speakers} 
                    participants={room.participants} 
                    hostId={room.hostId}
                    currentUser={mockRooms[0].speakers[0]} // Mock current user
                  />
                </div>
              )}
            </>
          )}
        </div>
        
        <RoomControls 
          roomId={room.id}
          currentUser={mockRooms[0].speakers[0]} // Mock current user
          onToggleChat={toggleChat}
          onToggleParticipants={toggleParticipants}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          onLeaveRoom={handleLeaveRoom}
        />
      </main>
    </div>
  );
}
