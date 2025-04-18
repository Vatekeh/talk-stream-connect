
import { Button } from "@/components/ui/button";
import { Eye, LinkIcon } from "lucide-react";

export function ContentLogActions() {
  return (
    <div className="flex items-center justify-end space-x-1">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <LinkIcon size={16} />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Eye size={16} />
      </Button>
    </div>
  );
}
