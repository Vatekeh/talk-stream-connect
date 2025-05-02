import { User } from "@/types";
import { ParticipantList } from "./participant-list";
import { RoomChat } from "./room-chat";

interface RoomContentProps {
  roomId: string;
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser?: User | null;
  remoteUsers: any[];
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  onKickUser?: (userId: string) => void;
}

export function RoomContent({
  roomId,
  speakers,
  participants,
  hostId,
  currentUser,
  remoteUsers,
  isChatOpen,
  isParticipantsOpen,
  onKickUser
}: RoomContentProps) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-4 mb-4">
      <div className="col-span-1 space-y-4">
        {/* Main room content goes here */}
      </div>
      
      {/* Sidebar for chat and participants */}
      <div className="col-span-1 h-[calc(100vh-300px)] min-h-[500px]">
        {isChatOpen && <RoomChat />}
        
        {isParticipantsOpen && (
          <ParticipantList
            speakers={speakers}
            participants={participants}
            hostId={hostId}
            currentUser={currentUser}
            roomId={roomId}
            onKickUser={onKickUser}
          />
        )}
      </div>
    </div>
  );
}
