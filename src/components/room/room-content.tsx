
import { User } from "@/types";
import { ParticipantList } from "./participant-list";
import { RoomChat } from "./room-chat";
import { RoomStage } from "./room-stage";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-is-mobile";

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
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="flex-1 h-[calc(100vh-200px)] min-h-[300px] bg-background">
        <RoomStage 
          speakers={speakers} 
          remoteUsers={remoteUsers}
        />
      </div>
    );
  }
  
  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="flex-1 h-[calc(100vh-280px)] min-h-[400px] rounded-lg overflow-hidden"
    >
      {/* Main stage area (always visible) */}
      <ResizablePanel defaultSize={70} minSize={40} className="bg-background">
        <RoomStage 
          speakers={speakers} 
          remoteUsers={remoteUsers}
        />
      </ResizablePanel>
      
      {/* Resizable divider */}
      <ResizableHandle withHandle />
      
      {/* Right sidebar for chat and participants */}
      <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className="flex flex-col">
        <div className="flex flex-col h-full">
          {isChatOpen && (
            <div className={`flex-1 ${isParticipantsOpen ? 'h-1/2' : 'h-full'}`}>
              <RoomChat roomId={roomId} />
            </div>
          )}
          
          {isParticipantsOpen && (
            <div className={`flex-1 ${isChatOpen ? 'h-1/2' : 'h-full'}`}>
              <ParticipantList
                speakers={speakers}
                participants={participants}
                hostId={hostId}
                currentUser={currentUser}
                roomId={roomId}
                onKickUser={onKickUser}
              />
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
