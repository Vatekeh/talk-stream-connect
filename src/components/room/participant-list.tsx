
import { User } from "@/types";
import { 
  Hand, 
  Mic, 
  MicOff, 
  MoreVertical, 
  ShieldAlert, 
  ShieldCheck, 
  User as UserIcon 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParticipantListProps {
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser?: User;
}

export function ParticipantList({ 
  speakers, 
  participants, 
  hostId, 
  currentUser 
}: ParticipantListProps) {
  const isHost = currentUser?.id === hostId;
  const isModerator = currentUser?.isModerator;
  
  const canModerate = isHost || isModerator;
  
  const renderUserControls = (user: User) => {
    if (!canModerate && user.id !== currentUser?.id) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canModerate && user.id !== currentUser?.id && (
            <>
              {user.isSpeaker ? (
                <DropdownMenuItem>Remove as speaker</DropdownMenuItem>
              ) : (
                <DropdownMenuItem>Make speaker</DropdownMenuItem>
              )}
              
              {user.isModerator ? (
                <DropdownMenuItem>Remove as moderator</DropdownMenuItem>
              ) : (
                <DropdownMenuItem>Make moderator</DropdownMenuItem>
              )}
              
              <DropdownMenuItem className="text-destructive">
                Remove from room
              </DropdownMenuItem>
            </>
          )}
          
          {user.id === currentUser?.id && (
            <>
              {user.isSpeaker && (
                user.isMuted ? (
                  <DropdownMenuItem>Unmute</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>Mute</DropdownMenuItem>
                )
              )}
              <DropdownMenuItem>Leave room</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  const renderUserIcon = (user: User) => {
    if (user.id === hostId) {
      return <ShieldCheck size={14} className="text-talkstream-purple" />;
    }
    if (user.isModerator) {
      return <ShieldAlert size={14} className="text-talkstream-purple" />;
    }
    if (user.isHandRaised) {
      return <Hand size={14} className="text-amber-500" />;
    }
    return null;
  };
  
  const renderUserStatus = (user: User) => {
    if (user.isSpeaker) {
      return user.isMuted ? (
        <MicOff size={14} className="text-muted-foreground" />
      ) : (
        <Mic size={14} className="text-green-500" />
      );
    }
    return <UserIcon size={14} className="text-muted-foreground" />;
  };
  
  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden border">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium">Participants</h3>
      </div>
      
      <ScrollArea className="flex-1">
        {speakers.length > 0 && (
          <div className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
              SPEAKERS ({speakers.length})
            </h4>
            <div className="space-y-1">
              {speakers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-talkstream-purple text-white">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{user.name}</span>
                      {renderUserIcon(user)}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {renderUserStatus(user)}
                    {renderUserControls(user)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {participants.length > 0 && (
          <div className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
              PARTICIPANTS ({participants.length})
            </h4>
            <div className="space-y-1">
              {participants.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-talkstream-purple text-white">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{user.name}</span>
                      {renderUserIcon(user)}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-amber-500"
                      title="Raise hand"
                    >
                      <Hand size={14} />
                    </Button>
                    {renderUserControls(user)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
