
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video } from "lucide-react";

export function CreateLiveKitRoomDialog() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();
  
  const handleCreateRoom = () => {
    if (!roomName.trim()) return;
    
    setIsCreating(true);
    
    // Generate a URL-friendly version of the room name
    const urlRoomName = roomName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    
    setIsCreating(false);
    setOpen(false);
    
    // Reset form
    setRoomName("");
    
    // Navigate to the video room page
    navigate(`/video-room/${urlRoomName}`);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Video size={18} />
          Start Video Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new video room</DialogTitle>
          <DialogDescription>
            Create a video room where you can connect with others in real-time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="room-name">Room name</Label>
            <Input
              id="room-name"
              placeholder="E.g., Team Meeting"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRoom} 
            disabled={!roomName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
