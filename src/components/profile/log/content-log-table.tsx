
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, LinkIcon } from "lucide-react";
import { NsfwContentLog } from "@/types";

interface ContentLogTableProps {
  logs: NsfwContentLog[];
}

export function ContentLogTable({ logs }: ContentLogTableProps) {
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Page Title</TableHead>
            <TableHead>Visit Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
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
                  <div className="flex items-center justify-end space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <LinkIcon size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
