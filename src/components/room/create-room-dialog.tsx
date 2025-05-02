
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomTopic, setRoomTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleCreateRoom = async () => {
    if (!roomName.trim() || !user) return;
    
    setIsCreating(true);
    
    try {
      // Create room in the database
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          name: roomName,
          description: roomDescription || null,
          topic: roomTopic || null,
          host_id: user.id,
          creator_id: user.id, // Set creator_id explicitly
          is_active: true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Join the room as a host (speaker and moderator)
      // Also set is_creator = true to identify as room creator
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          is_speaker: true,
          is_moderator: true,
          is_muted: false,
          is_creator: true // Mark user as creator in participants table
        });
        
      if (participantError) throw participantError;

      // Reset form
      setRoomName("");
      setRoomDescription("");
      setRoomTopic("");
      
      // Close the dialog and navigate to the new room
      setOpen(false);
      navigate(`/room/${room.id}`);
      
      toast({
        title: "Room created",
        description: `Your room "${roomName}" has been created successfully.`,
      });
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast({
        title: "Error creating room",
        description: error.message || "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
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
            disabled={!roomName.trim() || isCreating || !user}
          >
            {isCreating ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
