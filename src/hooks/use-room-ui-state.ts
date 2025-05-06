
import { useState, useRef } from "react";
import { MobileSheetRef } from "@/components/room/mobile/mobile-sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";

/**
 * Hook to manage room UI state (chat, participants panels, etc.)
 */
export function useRoomUIState() {
  const isMobile = useIsMobile();
  
  // UI toggle state
  const [isChatOpen, setIsChatOpen] = useState(!isMobile);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(!isMobile);
  
  // Reference for the mobile bottom sheet
  const mobileSheetRef = useRef<MobileSheetRef>(null);
  
  // UI toggle functions
  const toggleChat = () => {
    if (isMobile) {
      mobileSheetRef.current?.setTab('chat');
      mobileSheetRef.current?.open();
    } else {
      setIsChatOpen(!isChatOpen);
    }
  };
  
  const toggleParticipants = () => {
    if (isMobile) {
      mobileSheetRef.current?.setTab('people');
      mobileSheetRef.current?.open();
    } else {
      setIsParticipantsOpen(!isParticipantsOpen);
    }
  };
  
  return {
    isMobile,
    isChatOpen,
    isParticipantsOpen,
    mobileSheetRef,
    toggleChat,
    toggleParticipants
  };
}
