
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
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-gradient-to-r from-[#1A1F2C] to-[#2A3542] p-6 rounded-xl">
      <div className="flex items-center space-x-4">
        <Avatar className="h-24 w-24 border-4 border-[#8B5CF6] shadow-md">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-[#9b87f5] text-white text-2xl">
            {user.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        
        {/* Clutch Logo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6] text-white font-bold">
          🚀
        </div>
      </div>
      
      <div className="flex-1 space-y-2 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-3xl font-bold text-[#E5DEFF]">{user.name}</h1>
          {user.pronouns && (
            <span className="text-[#9b87f5] text-sm">({user.pronouns})</span>
          )}
          {user.isModerator && (
            <Badge variant="secondary" className="ml-0 sm:ml-2 bg-[#7E69AB] text-white">Moderator</Badge>
          )}
        </div>
        
        {user.bio && (
          <p className="text-[#D6BCFA] max-w-2xl">{user.bio}</p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm text-[#E5DEFF]">
          <div className="flex items-center gap-1">
            <UserIcon size={14} className="text-[#9b87f5]" />
            <span>Joined {formatDistanceToNow(new Date(user.createdAt || Date.now()), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onEditProfile} 
        className="md:self-start" 
        variant="outline" 
        size="sm"
      >
        <Edit className="mr-2 h-4 w-4 text-[#9b87f5]" />
        <span className="text-[#E5DEFF]">Edit Profile</span>
      </Button>
    </div>
  );
}
