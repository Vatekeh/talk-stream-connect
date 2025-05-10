
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, CreditCard, Settings, Plus, Users } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import { useProfile } from "@/contexts/ProfileContext";

export function UserDropdown() {
  const { user: authUser, signOut, isSubscribed } = useAuth();
  const { user } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };
  
  if (!user) return null;
  
  // Create initials from name for avatar fallback
  const initials = user.name.split(" ").map(n => n[0]).join("");
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex items-center space-x-2 outline-none">
        <div className="flex items-center space-x-2 rounded-full hover:bg-clutsh-slate/50 p-1 transition-colors">
          <Avatar className="h-8 w-8 border-2 border-clutsh-slate">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-clutsh-slate text-clutsh-light">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-clutsh-light hidden md:inline-block">
            {user.name}
          </span>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-clutsh-midnight border-clutsh-slate shadow-lg shadow-black/20"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>My Account</span>
          {isSubscribed && (
            <Badge 
              variant="outline" 
              className="bg-clutsh-slate/30 text-clutsh-light border-talkstream-purple-dark"
            >
              Pro Member
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-clutsh-slate/50" />
        
        <DropdownMenuGroup>
          <Link to="/profile">
            <DropdownMenuItem className="cursor-pointer hover:bg-clutsh-slate/50 focus:bg-clutsh-slate/50">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/pricing">
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-clutsh-slate/50 focus:bg-clutsh-slate/50"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/settings">
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-clutsh-slate/50 focus:bg-clutsh-slate/50"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-clutsh-slate/50" />
        
        <DropdownMenuGroup>
          <Link to="/room/new">
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-clutsh-slate/50 focus:bg-clutsh-slate/50"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Room</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/houses">
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-clutsh-slate/50 focus:bg-clutsh-slate/50"
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Join Public House</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-clutsh-slate/50" />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer hover:bg-clutsh-slate/50 focus:bg-clutsh-slate/50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
