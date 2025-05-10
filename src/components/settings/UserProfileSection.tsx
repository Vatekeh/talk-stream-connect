
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/contexts/ProfileContext";

export function UserProfileSection() {
  const { user } = useProfile();
  
  if (!user) return null;
  
  // Create initials from name for avatar fallback
  const initials = user.name.split(" ").map(n => n[0]).join("");
  
  return (
    <Link to="/profile" className="block">
      <div className="flex items-center justify-between py-4 border-b border-clutsh-slate/30 hover:bg-clutsh-slate/10 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-clutsh-slate">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-clutsh-slate text-clutsh-light">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="font-medium text-clutsh-light">{user.name}</span>
            <span className="text-sm text-clutsh-muted">@{user.name.toLowerCase().replace(/\s+/g, '')}</span>
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-clutsh-muted" />
      </div>
    </Link>
  );
}
