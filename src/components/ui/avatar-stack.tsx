
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function AvatarStack({ users, max = 3, size = "md" }: AvatarStackProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base"
  };
  
  const avatarClass = sizeClasses[size];
  
  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user) => (
        <Avatar key={user.id} className={`${avatarClass} border-2 border-background`}>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-talkstream-purple text-white">
            {user.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div className={`${avatarClass} flex items-center justify-center rounded-full bg-muted border-2 border-background`}>
          <span className="text-foreground font-medium">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}
