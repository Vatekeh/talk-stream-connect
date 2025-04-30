
/**
 * ContentLogEmpty Component
 * 
 * Displays a message when no logs are available.
 * Spans across all columns to maintain table structure.
 */
import { TableCell, TableRow } from "@/components/ui/table";

export function ContentLogEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        No logs found.
      </TableCell>
    </TableRow>
  );
}
