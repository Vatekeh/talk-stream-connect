
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3 } from "lucide-react";
import { TrialCountdown } from "@/components/subscription/TrialCountdown";
import { useAuth } from "@/contexts/AuthContext";

export function UserProfileHeader() {
  const { user, setIsEditProfileOpen } = useProfile();
  const { isTrialing } = useAuth();

  if (!user) {
    return <div className="h-60 bg-gray-100 animate-pulse rounded-md" />;
  }

  return (
    <div className="relative flex flex-col items-center p-6 rounded-lg bg-clutsh-steel text-clutsh-light">
      {/* Trial countdown banner */}
      {isTrialing && (
        <div className="absolute top-2 right-2">
          <TrialCountdown />
        </div>
      )}
      
      {/* User avatar */}
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-clutsh-midnight">
          <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
          <AvatarFallback className="bg-clutsh-slate text-clutsh-light text-xl">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {/* User info */}
      <div className="mt-4 text-center">
        <h2 className="text-xl font-bold">{user.name}</h2>
        
        {user.pronouns && (
          <span className="text-sm text-clutsh-muted mt-1 block">
            {user.pronouns}
          </span>
        )}
        
        {user.bio && (
          <p className="mt-2 text-clutsh-muted max-w-md">
            {user.bio}
          </p>
        )}
        
        {user.isModerator && (
          <div className="mt-2">
            <span className="bg-clutsh-slate text-xs font-medium text-clutsh-light px-2.5 py-0.5 rounded">
              Moderator
            </span>
          </div>
        )}
      </div>
      
      {/* Edit profile button */}
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel"
          onClick={() => setIsEditProfileOpen(true)}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
