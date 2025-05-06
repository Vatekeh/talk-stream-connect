
import { Button } from "@/components/ui/button";
import { Hand, Mic, MicOff, MessageSquare, Users, Plus } from "lucide-react";
import { useAgora } from "@/contexts/AgoraContext";
import { MobileSheetRef } from "./mobile-sheet";

interface MobileRoomControlsProps {
  sheetRef: React.RefObject<MobileSheetRef>;
  isHandRaised: boolean;
  onToggleHand: () => void;
  canUseMic: boolean;
  isTransitioning: boolean;
  connectionState: string;
  onOpenInvite?: () => void;
}

export function MobileRoomControls({
  sheetRef,
  isHandRaised,
  onToggleHand,
  canUseMic,
  isTransitioning,
  connectionState,
  onOpenInvite
}: MobileRoomControlsProps) {
  const { toggleMute, isMuted } = useAgora();
  
  const handleToggleMute = async () => {
    await toggleMute();
  };
  
  const openChatTab = () => {
    if (sheetRef.current) {
      sheetRef.current.setTab('chat');
      sheetRef.current.open();
    }
  };
  
  const openPeopleTab = () => {
    if (sheetRef.current) {
      sheetRef.current.setTab('people');
      sheetRef.current.open();
    }
  };
  
  return (
    <>
      {/* Floating action button */}
      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-[88px] right-4 rounded-full shadow-lg z-10"
        onClick={onOpenInvite}
      >
        <Plus size={20} />
      </Button>
      
      {/* Bottom toolbar */}
      <div className="fixed bottom-0 inset-x-0 h-16 bg-background/95 backdrop-blur-sm border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 z-20">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 flex-col items-center justify-center h-14 space-y-1"
          onClick={canUseMic ? handleToggleMute : onToggleHand}
          disabled={isTransitioning || connectionState === "disconnected"}
        >
          <div className="h-6 flex items-center justify-center">
            {canUseMic ? (
              isMuted ? <MicOff size={20} /> : <Mic size={20} />
            ) : (
              <Hand size={20} className={isHandRaised ? "text-amber-500" : ""} />
            )}
          </div>
          <span className="text-xs">{canUseMic ? (isMuted ? "Unmute" : "Mute") : (isHandRaised ? "Lower" : "Raise")}</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="flex-1 flex-col items-center justify-center h-14 space-y-1"
          onClick={openChatTab}
        >
          <div className="h-6 flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <span className="text-xs">Chat</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="flex-1 flex-col items-center justify-center h-14 space-y-1"
          onClick={openPeopleTab}
        >
          <div className="h-6 flex items-center justify-center">
            <Users size={20} />
          </div>
          <span className="text-xs">People</span>
        </Button>
      </div>
    </>
  );
}
