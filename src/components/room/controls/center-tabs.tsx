
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CenterTabsProps {
  isMobile: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
}

export function CenterTabs({
  isMobile,
  isChatOpen, 
  isParticipantsOpen,
  onToggleChat,
  onToggleParticipants
}: CenterTabsProps) {
  // Mobile version
  if (isMobile) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleChat}
          className={isChatOpen ? "bg-primary/20 text-primary border-primary/20" : ""}
        >
          <MessageSquare size={16} className="mr-1" />
          Chat
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleParticipants}
          className={isParticipantsOpen ? "bg-primary/20 text-primary border-primary/20" : ""}
        >
          <Users size={16} className="mr-1" />
          People
        </Button>
      </div>
    );
  }
  
  // Desktop version
  return (
    <Tabs defaultValue={isChatOpen ? "chat" : "participants"} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger 
          value="chat" 
          onClick={onToggleChat}
          className={!isChatOpen ? "text-muted-foreground" : ""}
        >
          <MessageSquare size={16} className="mr-2" />
          Chat
        </TabsTrigger>
        <TabsTrigger 
          value="participants" 
          onClick={onToggleParticipants}
          className={!isParticipantsOpen ? "text-muted-foreground" : ""}
        >
          <Users size={16} className="mr-2" />
          Participants
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
