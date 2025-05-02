
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

export function MessageInput({ onSendMessage, isDisabled }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isDisabled) return;
    
    onSendMessage(newMessage);
    setNewMessage("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
      <Input
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="flex-1"
        disabled={isDisabled}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!newMessage.trim() || isDisabled}
      >
        <SendHorizontal size={18} />
      </Button>
    </form>
  );
}
