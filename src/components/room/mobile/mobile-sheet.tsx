
import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RoomChat } from "../room-chat";
import { ParticipantList } from "../participant-list";
import { User } from "@/types";

export interface MobileSheetRef {
  open: () => void;
  close: () => void;
  setTab: (tab: string) => void;
}

interface MobileSheetProps {
  roomId: string;
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser?: User | null;
  onKickUser?: (userId: string) => void;
}

export const MobileSheet = forwardRef<MobileSheetRef, MobileSheetProps>(
  ({ roomId, speakers, participants, hostId, currentUser, onKickUser }, ref) => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("chat");
    
    const isHost = currentUser?.id === hostId;
    const isModerator = currentUser?.isModerator;
    const canModerate = isHost || isModerator;
    
    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      setTab: (newTab: string) => setTab(newTab)
    }));

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="hidden" />
        <SheetContent
          side="bottom"
          className="h-[65vh] p-0 flex flex-col rounded-t-xl border-t border-b-0 border-l-0 border-r-0"
        >
          <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 px-2 py-2 bg-background/50 backdrop-blur-sm border-b sticky top-0 z-10">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              {canModerate && (
                <TabsTrigger value="host">
                  Host
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="chat" className="flex-1 overflow-hidden m-0 p-0 data-[state=active]:flex flex-col">
              <RoomChat roomId={roomId} />
            </TabsContent>
            
            <TabsContent value="people" className="flex-1 overflow-hidden m-0 p-0 data-[state=active]:flex flex-col">
              <ParticipantList
                speakers={speakers}
                participants={participants}
                hostId={hostId}
                currentUser={currentUser}
                roomId={roomId}
                onKickUser={onKickUser}
              />
            </TabsContent>
            
            {canModerate && (
              <TabsContent value="host" className="flex-1 overflow-auto p-4 m-0">
                <h3 className="text-lg font-medium mb-4">Host Controls</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  As a {isHost ? 'host' : 'moderator'}, you have additional controls for managing participants.
                  Use the People tab to manage individual participants.
                </p>
                {/* Host-specific actions could be added here */}
              </TabsContent>
            )}
          </Tabs>
        </SheetContent>
      </Sheet>
    );
  }
);

MobileSheet.displayName = "MobileSheet";
