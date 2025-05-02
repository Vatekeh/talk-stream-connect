
import { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageItemProps {
  message: Message;
  formatMessageTime: (timestamp: string) => string;
}

export function MessageItem({ message, formatMessageTime }: MessageItemProps) {
  return (
    <div className="flex gap-3">
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
  );
}
