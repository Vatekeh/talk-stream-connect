
/**
 * ContentLogActions component provides interactive buttons for each log entry
 * Includes options to copy link and view details
 */
import { Button } from "@/components/ui/button";
import { Eye, LinkIcon } from "lucide-react";

export function ContentLogActions() {
  return (
    <div className="flex items-center justify-end space-x-1">
      {/* Copy link button */}
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <LinkIcon size={16} />
      </Button>
      
      {/* View details button */}
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Eye size={16} />
      </Button>
    </div>
  );
}
