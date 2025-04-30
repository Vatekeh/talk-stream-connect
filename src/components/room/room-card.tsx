
import { Room } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { BadgePulse } from "@/components/ui/badge-pulse";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  // Calculate actual participant count - only count real participants
  const participantCount = room.speakers.length + room.participants.length;
  const timeSince = formatDistanceToNow(new Date(room.createdAt), { addSuffix: true });
  
  // Skip rendering this card if the room is empty (no participants) or not active
  if (participantCount === 0 || !room.isLive) {
    return null;
  }
  
  return (
    <Card className="room-shadow transition-all duration-200 hover:translate-y-[-4px] animate-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <BadgePulse color="purple">LIVE</BadgePulse>
            <CardDescription>{timeSince}</CardDescription>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{participantCount}</span>
          </div>
        </div>
        <CardTitle className="text-xl mt-2 line-clamp-1">{room.name}</CardTitle>
        {room.description && (
          <CardDescription className="line-clamp-2">{room.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={room.hostAvatar} alt={room.hostName} />
              <AvatarFallback className="bg-talkstream-purple text-white">
                {room.hostName.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{room.hostName}</p>
              <p className="text-xs text-muted-foreground">Host</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {room.speakers.length > 0 && (
              <AvatarStack users={room.speakers} max={3} size="sm" />
            )}
            
            <Button variant="default" size="sm" asChild>
              <Link to={`/room/${room.id}`}>Join</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
