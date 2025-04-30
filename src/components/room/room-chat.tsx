
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockMessages } from "@/lib/mock-data"; // Import mock messages for now

interface RoomChatProps {
  roomId: string;
  messages?: Message[];
}

export function RoomChat({ roomId, messages = mockMessages }: RoomChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // This would be replaced with actual Supabase integration
    console.log("Sending message to room", roomId, newMessage);
    setNewMessage("");
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden border">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium">Chat</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={message.userAvatar} alt={message.userName} />
                <AvatarFallback className="bg-talkstream-purple text-white">
                  {message.userName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {message.userName}
                  </span>
                  {message.isModerator && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-talkstream-purple/10 text-talkstream-purple font-medium">
                      MOD
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim()}
        >
          <SendHorizontal size={18} />
        </Button>
      </form>
    </div>
  );
}
