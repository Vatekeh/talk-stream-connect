
import { useState, useEffect } from "react";
import { Message } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Custom hook for handling room messages
 * Manages fetching, sending, and subscribing to real-time updates
 */
export function useRoomMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load initial messages and subscribe to new ones
  useEffect(() => {
    setIsLoading(true);
    
    // Fetch existing messages for this room
    const fetchMessages = async () => {
      try {
        // Fetch messages first
        const { data: messagesData, error: messagesError } = await supabase
          .from('room_messages')
          .select(`
            id, 
            content, 
            created_at, 
            is_system_message,
            room_id,
            user_id
          `)
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
          
        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          toast.error("Could not load chat messages");
          setIsLoading(false);
          return;
        }
        
        if (!messagesData || messagesData.length === 0) {
          setMessages([]);
          setIsLoading(false);
          return;
        }
        
        // Extract unique user IDs from messages
        const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, is_moderator')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          toast.error("Could not load user profiles");
        }
        
        // Create a map of profiles for easy lookup
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
        
        // Format the messages with profile data
        const formattedMessages = messagesData.map(msg => {
          const profile = profilesMap.get(msg.user_id);
          
          return {
            id: msg.id,
            userId: msg.user_id,
            userName: profile?.username || 'Anonymous',
            userAvatar: profile?.avatar_url,
            content: msg.content,
            timestamp: msg.created_at,
            isModerator: profile?.is_moderator || false,
            isSystem: msg.is_system_message
          };
        });
        
        setMessages(formattedMessages);
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
  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('room_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: content.trim(),
          is_system_message: false
        });
        
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return false;
      } 
      return true;
    } catch (err) {
      console.error("Exception when sending message:", err);
      toast.error("Could not send message. Please try again.");
      return false;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
}
