
/**
 * RoomHeader Component
 * 
 * Displays the header section of a room including:
 * - Navigation back to rooms list
 * - Live status badge
 * - Participant count
 * - Room name and description
 * - Host information with avatar
 * - Exit Room button for users
 */
import { Link } from "react-router-dom";
import { ChevronLeft, Users, LogOut, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgePulse } from "@/components/ui/badge-pulse";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";

interface RoomHeaderProps {
  room: Room;
  participantCount: number;
  currentUserId?: string;
  onExitRoom?: () => void;
  isCreator?: boolean;
}

export function RoomHeader({ room, participantCount, currentUserId, onExitRoom, isCreator = false }: RoomHeaderProps) {
  return (
    <div className="mb-4 bg-background rounded-lg p-3 sticky top-0 border shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="mr-1">
            <Link to="/">
              <ChevronLeft size={16} />
            </Link>
          </Button>

          {/* Room title */}
          <h1 className="text-lg font-bold truncate">{room?.name}</h1>

          {/* Live status indicator - only show for active rooms */}
          {room.isLive ? (
            <BadgePulse color="purple" className="ml-2">LIVE</BadgePulse>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground ml-2">INACTIVE</span>
          )}
          
          {/* Participant count */}
          <div className="flex items-center text-sm text-muted-foreground ml-3">
            <Users size={14} className="mr-1" />
            {participantCount} 
          </div>
        </div>
        
        {/* Host avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarImage src={room?.hostAvatar} alt={room?.hostName || ""} />
            <AvatarFallback className="bg-talkstream-purple text-white">
              {room?.hostName ? room.hostName.split(" ").map(n => n[0]).join("") : "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline-block">
            {room?.hostName}
            <span className="text-xs text-muted-foreground ml-1">Host</span>
          </span>

          {/* Show Exit Room button for active rooms only */}
          {currentUserId && onExitRoom && room.isLive && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExitRoom} 
              className="text-destructive hover:bg-destructive/10 ml-4"
            >
              <LogOut size={16} className="mr-1" />
              <span className="hidden sm:inline">Exit Room</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
