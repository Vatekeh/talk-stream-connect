
import { Link } from "react-router-dom";
import { ChevronLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgePulse } from "@/components/ui/badge-pulse";
import { Room } from "@/types";

interface MobileRoomHeaderProps {
  room: Room;
  participantCount: number;
}

export function MobileRoomHeader({ room, participantCount }: MobileRoomHeaderProps) {
  return (
    <div className="h-14 px-3 py-2 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-20 border-b">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link to="/">
            <ChevronLeft size={16} />
          </Link>
        </Button>
        
        <h1 className="text-sm font-medium truncate max-w-[120px]">
          {room?.name}
        </h1>
        
        {room.isLive ? (
          <BadgePulse color="purple" className="ml-1 scale-90">LIVE</BadgePulse>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground ml-1">
            INACTIVE
          </span>
        )}
      </div>
      
      <div className="flex items-center text-xs">
        <Users size={12} className="mr-1" />
        <span>{participantCount}</span>
      </div>
    </div>
  );
}
