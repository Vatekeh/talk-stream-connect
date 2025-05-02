
/**
 * RoomChat Component
 * 
 * Displays and manages the chat interface for audio rooms.
 * Handles message display, scrolling, and message sending with Supabase integration.
 */
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RoomChatProps {
  roomId: string;
}

export function RoomChat({ roomId }: RoomChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Load initial messages and subscribe to new ones
  useEffect(() => {
    setIsLoading(true);
    
    // Fetch existing messages for this room
    const fetchMessages = async () => {
      try {
        // Updated query to correctly join with profiles table
        const { data, error } = await supabase
          .from('room_messages')
          .select(`
            id, 
            content, 
            created_at, 
            is_system_message,
            room_id,
            user_id,
            profiles:profiles(username, avatar_url, is_moderator)
          `)
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching messages:", error);
          toast.error("Could not load chat messages");
        } else {
          // Format the messages to match our Message type
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            userId: msg.user_id,
            userName: msg.profiles?.username || 'Anonymous',
            userAvatar: msg.profiles?.avatar_url,
            content: msg.content,
            timestamp: msg.created_at,
            isModerator: msg.profiles?.is_moderator || false,
            isSystem: msg.is_system_message
          }));
          
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error("Exception when fetching messages:", err);
        toast.error("Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${roomId}-messages`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          console.log("New message received:", payload);
          
          // Fetch user details for the new message
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('username, avatar_url, is_moderator')
              .eq('id', payload.new.user_id)
              .single();
              
            if (error) {
              console.error("Error fetching user profile:", error);
            }
            
            // Add the new message to the state
            const newMsg: Message = {
              id: payload.new.id,
              userId: payload.new.user_id,
              userName: data?.username || 'Anonymous',
              userAvatar: data?.avatar_url || undefined,
              content: payload.new.content,
              timestamp: payload.new.created_at,
              isModerator: data?.is_moderator || false,
              isSystem: payload.new.is_system_message
            };
            
            setMessages(prev => [...prev, newMsg]);
          } catch (err) {
            console.error("Error processing new message:", err);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);
  
  /**
   * Handles sending a new message
   * Stores the message in Supabase
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('room_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: newMessage.trim(),
          is_system_message: false
        });
        
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      } else {
        // Clear input on successful send
        setNewMessage("");
      }
    } catch (err) {
      console.error("Exception when sending message:", err);
      toast.error("Could not send message. Please try again.");
    }
  };
  
  /**
   * Auto-scrolls chat to the most recent message
   */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  /**
   * Formats message timestamps to readable time
   * @param timestamp - ISO timestamp string
   * @returns Formatted time string (e.g., "2:30 PM")
   */
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden border">
      {/* Chat header */}
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium">Chat</h3>
      </div>
      
      {/* Scrollable message area */}
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
              <div key={message.id} className="flex gap-3">
                {/* User avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.userAvatar} alt={message.userName} />
                  <AvatarFallback className="bg-talkstream-purple text-white">
                    {message.userName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                {/* Message content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {/* Username display */}
                    <span className="font-medium text-sm">
                      {message.userName}
                    </span>
                    
                    {/* Moderator badge if applicable */}
                    {message.isModerator && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-talkstream-purple/10 text-talkstream-purple font-medium">
                        MOD
                      </span>
                    )}
                    
                    {/* System message badge if applicable */}
                    {message.isSystem && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium">
                        SYSTEM
                      </span>
                    )}
                    
                    {/* Message timestamp */}
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {/* Message text */}
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>
      
      {/* Message input form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={isLoading || !user}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim() || isLoading || !user}
        >
          <SendHorizontal size={18} />
        </Button>
      </form>
    </div>
  );
}
