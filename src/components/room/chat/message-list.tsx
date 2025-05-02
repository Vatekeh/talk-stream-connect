
import { useRef, useEffect } from "react";
import { Message } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "lucide-react";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  formatMessageTime: (timestamp: string) => string;
}

export function MessageList({ messages, isLoading, formatMessageTime }: MessageListProps) {
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scrolls chat to the most recent message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Loader size={20} className="animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              formatMessageTime={formatMessageTime} 
            />
          ))
        )}
        <div ref={messageEndRef} />
      </div>
    </ScrollArea>
  );
}
