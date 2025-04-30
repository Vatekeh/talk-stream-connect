
import { Link } from "react-router-dom";
import { ChevronLeft, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgePulse } from "@/components/ui/badge-pulse";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";

interface RoomHeaderProps {
  room: Room;
  participantCount: number;
}

export function RoomHeader({ room, participantCount }: RoomHeaderProps) {
  return (
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
          
          <h1 className="text-2xl font-bold">{room?.name}</h1>
          {room?.description && <p className="text-muted-foreground">{room.description}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border-2 border-background">
            <AvatarImage src={room?.hostAvatar} alt={room?.hostName || ""} />
            <AvatarFallback className="bg-talkstream-purple text-white">
              {room?.hostName ? room.hostName.split(" ").map(n => n[0]).join("") : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{room?.hostName}</p>
            <p className="text-xs text-muted-foreground">Host</p>
          </div>
        </div>
      </div>
    </div>
  );
}
