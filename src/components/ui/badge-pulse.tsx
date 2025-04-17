
import { cn } from "@/lib/utils";

interface BadgePulseProps {
  className?: string;
  children: React.ReactNode;
  color?: "default" | "purple" | "red" | "green";
}

export function BadgePulse({ 
  className, 
  children, 
  color = "default" 
}: BadgePulseProps) {
  const colorClasses = {
    default: "bg-slate-100 text-slate-800",
    purple: "bg-talkstream-purple/10 text-talkstream-purple",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800"
  };
  
  return (
    <div className={cn(
      "flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
      colorClasses[color],
      className
    )}>
      <span className="relative flex h-2 w-2">
        <span className={cn(
          "animate-pulse-light absolute inline-flex h-full w-full rounded-full opacity-75",
          color === "default" ? "bg-slate-400" : 
          color === "purple" ? "bg-talkstream-purple" : 
          color === "red" ? "bg-red-400" : 
          "bg-green-400"
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          color === "default" ? "bg-slate-500" : 
          color === "purple" ? "bg-talkstream-purple-dark" : 
          color === "red" ? "bg-red-500" : 
          "bg-green-500"
        )}></span>
      </span>
      <span>{children}</span>
    </div>
  );
}
