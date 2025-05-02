
/**
 * RoomChat Component
 * 
 * Displays and manages the chat interface for audio rooms.
 * Handles message display, scrolling, and message sending with Supabase integration.
 */
import { useAuth } from "@/contexts/AuthContext";
import { useRoomMessages } from "@/hooks/use-room-messages";
import { MessageList } from "./chat/message-list";
import { MessageInput } from "./chat/message-input";
import { formatMessageTime } from "./chat/utils";

interface RoomChatProps {
  roomId: string;
}

export function RoomChat({ roomId }: RoomChatProps) {
  const { messages, isLoading, sendMessage } = useRoomMessages(roomId);
  const { user } = useAuth();
  
  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };
  
  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden border">
      {/* Chat header */}
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium">Chat</h3>
      </div>
      
      {/* Scrollable message area */}
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        formatMessageTime={formatMessageTime}
      />
      
      {/* Message input form */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        isDisabled={isLoading || !user}
      />
    </div>
  );
}
