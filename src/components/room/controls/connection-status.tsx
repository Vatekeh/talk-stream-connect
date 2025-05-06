
import { Loader2 } from "lucide-react";
import { ConnectionState } from "@/contexts/agora/types";

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  isTransitioning: boolean;
}

export function getConnectionStatusText(connectionState: ConnectionState): string {
  switch(connectionState) {
    case "connecting": return "Connecting...";
    case "disconnecting": return "Disconnecting...";
    case "publishing": return "Setting up audio...";
    case "reconnecting": return "Reconnecting...";
    default: return "";
  }
}

export function ConnectionStatus({ connectionState, isTransitioning }: ConnectionStatusProps) {
  if (!isTransitioning) return null;
  
  return (
    <span className="text-xs text-muted-foreground flex items-center gap-2">
      <Loader2 size={16} className="animate-spin" />
      {getConnectionStatusText(connectionState)}
    </span>
  );
}
