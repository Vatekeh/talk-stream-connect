
/**
 * ContentLogRow component renders a single row in the content log table
 * with formatted timestamp, duration, and action buttons.
 */
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NsfwContentLog } from "@/types";
import { ContentLogActions } from "./content-log-actions";

interface ContentLogRowProps {
  log: NsfwContentLog;
  formatDuration: (seconds: number) => string;
}

export function ContentLogRow({ log, formatDuration }: ContentLogRowProps) {
  return (
    <TableRow key={log.id}>
      {/* Source cell with emphasized styling */}
      <TableCell className="font-medium">{log.source}</TableCell>
      
      {/* Page title cell with truncation for long titles */}
      <TableCell className="max-w-[200px] truncate" title={log.pageTitle}>
        {log.pageTitle}
      </TableCell>
      
      {/* Formatted timestamp cell */}
      <TableCell>
        {format(new Date(log.visitTimestamp), "MMM d, yyyy h:mm a")}
      </TableCell>
      
      {/* Duration cell with formatted time */}
      <TableCell>{formatDuration(log.duration)}</TableCell>
      
      {/* Category cell with styled badge */}
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {log.category}
        </Badge>
      </TableCell>
      
      {/* Actions cell with interaction buttons */}
      <TableCell>
        <ContentLogActions />
      </TableCell>
    </TableRow>
  );
}
