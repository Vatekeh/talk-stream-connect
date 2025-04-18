
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
