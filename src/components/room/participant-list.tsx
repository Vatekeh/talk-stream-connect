
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParticipantListProps {
  speakers: User[];
  participants: User[];
  hostId: string;
  currentUser?: User | null;
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
  
  // Function to update user status (speaker/moderator)
  const updateParticipantStatus = async (userId: string, updates: any) => {
    try {
      // First check if the user has a profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error checking user profile:", profileError);
        throw profileError;
      }
        
      // Create profile if it doesn't exist
      if (!profileData) {
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            // Use a default username for now
            username: 'Anonymous'
          });
            
        if (createProfileError) {
          console.error("Error creating user profile:", createProfileError);
          throw createProfileError;
        }
      }
      
      // Now update the participant status
      const { error } = await supabase
        .from('room_participants')
        .update(updates)
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error updating participant status:", error);
        throw error;
      }
      
      const action = updates.is_speaker !== undefined 
        ? (updates.is_speaker ? "promoted to speaker" : "removed as speaker")
        : (updates.is_moderator ? "promoted to moderator" : "removed as moderator");
      
      toast({
        title: "Status updated",
        description: `User has been ${action}.`,
      });
    } catch (error) {
      console.error("Error updating participant status:", error);
      toast({
        title: "Error updating status",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };
  
  // Function to remove participant from room
  const removeParticipant = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      
      toast({
        title: "User removed",
        description: "User has been removed from the room.",
      });
    } catch (error) {
      console.error("Error removing participant:", error);
      toast({
        title: "Error removing user",
        description: "Failed to remove user from room.",
        variant: "destructive",
      });
    }
  };
  
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
                <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_speaker: false })}>
                  Remove as speaker
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_speaker: true, is_muted: false })}>
                  Make speaker
                </DropdownMenuItem>
              )}
              
              {user.isModerator ? (
                <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_moderator: false })}>
                  Remove as moderator
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_moderator: true })}>
                  Make moderator
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => removeParticipant(user.id)}
              >
                Remove from room
              </DropdownMenuItem>
            </>
          )}
          
          {user.id === currentUser?.id && (
            <>
              {user.isSpeaker && (
                user.isMuted ? (
                  <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_muted: false })}>
                    Unmute
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => updateParticipantStatus(user.id, { is_muted: true })}>
                    Mute
                  </DropdownMenuItem>
                )
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  const renderUserIcon = (user: User) => {
    if (user.id === hostId) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ShieldCheck size={14} className="text-talkstream-purple" />
            </TooltipTrigger>
            <TooltipContent>Host</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (user.isModerator) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ShieldAlert size={14} className="text-talkstream-purple" />
            </TooltipTrigger>
            <TooltipContent>Moderator</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (user.isHandRaised) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Hand size={14} className="text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>Hand Raised</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return null;
  };
  
  const renderUserStatus = (user: User) => {
    if (user.isSpeaker) {
      return user.isMuted ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MicOff size={14} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Microphone Off</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Mic size={14} className="text-green-500" />
            </TooltipTrigger>
            <TooltipContent>Microphone On</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UserIcon size={14} className="text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>Listener</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
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
                      <AvatarImage src={user.avatar} alt={user.name || "User"} />
                      <AvatarFallback className="bg-talkstream-purple text-white">
                        {getInitials(user.name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{user.name || "Anonymous"}</span>
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
                    {user.isHandRaised && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Hand size={14} className="text-amber-500 mr-2" />
                          </TooltipTrigger>
                          <TooltipContent>Hand Raised</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
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
