
import { Edit, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface UserProfileHeaderProps {
  user: User;
  onEditProfile: () => void;
}

export function UserProfileHeader({ user, onEditProfile }: UserProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
      <Avatar className="h-24 w-24 border-4 border-background shadow-md">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="bg-talkstream-purple text-white text-2xl">
          {user.name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          {user.pronouns && (
            <span className="text-muted-foreground text-sm">({user.pronouns})</span>
          )}
          {user.isModerator && (
            <Badge variant="secondary" className="ml-0 sm:ml-2">Moderator</Badge>
          )}
        </div>
        
        {user.bio && (
          <p className="text-muted-foreground max-w-2xl">{user.bio}</p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <UserIcon size={14} />
            <span>Joined {formatDistanceToNow(new Date(user.createdAt || Date.now()), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      
      <Button onClick={onEditProfile} className="md:self-start" variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Edit Profile
      </Button>
    </div>
  );
}
