
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
    <div className="mb-4">
      {/* Back navigation and Exit Room button */}
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to="/">
            <ChevronLeft size={16} />
            Back to Rooms
          </Link>
        </Button>
        
        {/* Show Exit Room button for active rooms only */}
        {currentUserId && onExitRoom && room.isLive && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExitRoom} 
            className="text-destructive hover:bg-destructive/10"
          >
            <LogOut size={16} className="mr-1" />
            Exit Room
          </Button>
        )}
        
        {/* For inactive rooms, show the inactive status */}
        {!room.isLive && (
          <div className="flex items-center">
            <Clock size={16} className="text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">Inactive Room</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap justify-between items-start gap-4">
        {/* Room information section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Live status indicator - only show for active rooms */}
            {room.isLive ? (
              <BadgePulse color="purple">LIVE</BadgePulse>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">INACTIVE</span>
            )}
            
            {/* Participant count */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Users size={14} className="mr-1" />
              {participantCount} {room.isLive ? "Participants" : "Were Present"}
            </div>
          </div>
          
          {/* Room name and description */}
          <h1 className="text-2xl font-bold">{room?.name}</h1>
          {room?.description && <p className="text-muted-foreground">{room.description}</p>}
        </div>
        
        {/* Host information with avatar */}
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
