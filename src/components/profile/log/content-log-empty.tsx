
/**
 * ContentLogEmpty Component
 * 
 * Displays a message when no logs are available.
 * Spans across all columns to maintain table structure.
 */
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

export function ContentLogEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No content logs found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Content detection data will appear here when you use the Chrome extension.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
