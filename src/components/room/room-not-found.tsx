
/**
 * RoomNotFound Component
 * 
 * Displays a message when the requested room cannot be found.
 * Provides a button to navigate back to the rooms listing.
 */
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface RoomNotFoundProps {
  user: any | null;
}

export function RoomNotFound({ user }: RoomNotFoundProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* App header with authentication status */}
      <AppHeader 
        isAuthenticated={!!user} 
        userName={user?.user_metadata?.name || "User"} 
      />
      
      {/* Error message and navigation button */}
      <div className="flex-1 container flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Room not found</h1>
        <p className="text-muted-foreground mb-6">The room you're looking for doesn't exist or has ended.</p>
        <Button asChild>
          <Link to="/">Go back to rooms</Link>
        </Button>
      </div>
    </div>
  );
}
