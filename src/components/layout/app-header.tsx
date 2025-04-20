
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, ShieldAlert, User, Handshake } from "lucide-react";
import { NavigationLinks } from "./navigation-links";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
  isModerator?: boolean;
}

export function AppHeader({ 
  isAuthenticated = false, 
  userName = "Guest User", 
  userAvatar,
  isModerator = false
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useAuth();
  
  const handleLogout = () => {
    console.log("Logout button clicked, calling signOut()");
    signOut();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D4ED8] text-white">
              <Handshake className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">Clutch</span>
          </Link>
          
          <NavigationLinks 
            isModerator={isModerator} 
            className="hidden md:flex gap-6"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-talkstream-purple text-white">
                      {userName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isModerator ? "Moderator" : "User"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {isModerator && (
                  <DropdownMenuItem asChild>
                    <Link to="/moderation">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      <span>Moderation</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogIn className="mr-2 h-4 w-4 rotate-180" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Clutch</SheetTitle>
                <SheetDescription>
                  Live voice and chat rooms
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 flex flex-col gap-3">
                <NavigationLinks 
                  isModerator={isModerator} 
                  className="flex flex-col gap-3"
                  onClickLink={() => setIsMenuOpen(false)}
                />
                <Button 
                  variant="ghost" 
                  asChild 
                  className="justify-start" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
