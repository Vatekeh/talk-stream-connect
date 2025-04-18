
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
      <TableCell className="font-medium">{log.source}</TableCell>
      <TableCell className="max-w-[200px] truncate" title={log.pageTitle}>
        {log.pageTitle}
      </TableCell>
      <TableCell>
        {format(new Date(log.visitTimestamp), "MMM d, yyyy h:mm a")}
      </TableCell>
      <TableCell>{formatDuration(log.duration)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {log.category}
        </Badge>
      </TableCell>
      <TableCell>
        <ContentLogActions />
      </TableCell>
    </TableRow>
  );
}
