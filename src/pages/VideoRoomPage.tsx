
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/app-header";
import { VideoRoom } from "@/components/livekit/VideoRoom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function VideoRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const handleLeaveRoom = () => {
    navigate("/");
  };
  
  if (!roomId) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader isAuthenticated={true} />
        <main className="flex-1 container flex flex-col py-4">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
              <p className="mb-4">The room you are looking for does not exist.</p>
              <Button asChild>
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={true} />
      
      <main className="flex-1 container flex flex-col py-4">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="gap-1 mb-2">
            <Link to="/">
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </Button>
          
          <h1 className="text-2xl font-bold">{roomId}</h1>
          <p className="text-muted-foreground">Video Room</p>
        </div>
        
        <div className="flex-1">
          <VideoRoom roomName={roomId} onLeave={handleLeaveRoom} />
        </div>
      </main>
    </div>
  );
}
