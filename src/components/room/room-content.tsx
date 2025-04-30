
import { User } from "@/types";
import { RoomChat } from "./room-chat";
import { ParticipantList } from "./participant-list";
import { useMediaQuery } from "@/hooks/use-media-query";

interface RoomContentProps {
  roomId: string;
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser: User | null;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  remoteUsers: any[]; // Using any for now, but should be properly typed based on Agora types
}

export function RoomContent({
  roomId,
  speakers,
  participants,
  hostId,
  currentUser,
  isChatOpen,
  isParticipantsOpen,
  remoteUsers
}: RoomContentProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
      <div className={`md:col-span-2 lg:col-span-3 flex flex-col rounded-xl bg-accent p-4 ${isMobile && (isChatOpen || isParticipantsOpen) ? 'hidden' : ''}`}>
        <div className="flex-1 flex items-center justify-center">
          {/* Audio visualization or room status */}
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Audio Room</h2>
            <p className="text-muted-foreground">
              {remoteUsers.length > 0 
                ? `Connected with ${remoteUsers.length} other participants` 
                : 'Waiting for others to join...'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Mobile: Show either chat or participants, but not both */}
      {isMobile ? (
        <>
          {isChatOpen && (
            <div className="h-[calc(100vh-300px)]">
              <RoomChat roomId={roomId} messages={[]} />
            </div>
          )}
          
          {isParticipantsOpen && (
            <div className="h-[calc(100vh-300px)]">
              <ParticipantList 
                speakers={speakers} 
                participants={participants} 
                hostId={hostId}
                currentUser={currentUser}
              />
            </div>
          )}
        </>
      ) : (
        // Desktop: Show both based on toggle state
        <>
          {isChatOpen && (
            <div className="h-[calc(100vh-300px)]">
              <RoomChat roomId={roomId} messages={[]} />
            </div>
          )}
          
          {isParticipantsOpen && (
            <div className={`h-[calc(100vh-300px)] ${isChatOpen ? 'hidden lg:block' : ''}`}>
              <ParticipantList 
                speakers={speakers} 
                participants={participants} 
                hostId={hostId}
                currentUser={currentUser}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
