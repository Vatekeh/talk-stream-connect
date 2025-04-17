
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
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomTopic, setRoomTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();
  
  const handleCreateRoom = () => {
    if (!roomName.trim()) return;
    
    setIsCreating(true);
    
    // This would be replaced with actual Supabase integration
    setTimeout(() => {
      // Simulate room creation
      const newRoomId = Date.now().toString();
      setIsCreating(false);
      setOpen(false);
      
      // Reset form
      setRoomName("");
      setRoomDescription("");
      setRoomTopic("");
      
      // Navigate to the new room
      navigate(`/room/${newRoomId}`);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle size={18} />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
          <DialogDescription>
            Set up your room details. You'll be able to start speaking right away.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="room-name">Room name</Label>
            <Input
              id="room-name"
              placeholder="E.g., Tech Discussion"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room-topic" className="flex items-center justify-between">
              Topic <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="room-topic"
              placeholder="E.g., Technology, Business, Health"
              value={roomTopic}
              onChange={(e) => setRoomTopic(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room-description" className="flex items-center justify-between">
              Description <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="room-description"
              placeholder="Tell people what this room is about..."
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              className="max-h-32"
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
