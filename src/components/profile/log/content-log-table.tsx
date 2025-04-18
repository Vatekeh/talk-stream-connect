
/**
 * ContentLogTable component displays a table of NSFW content access logs
 * with sorting, formatting, and empty state handling.
 */
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { NsfwContentLog } from "@/types";
import { ContentLogRow } from "./content-log-row";
import { ContentLogEmpty } from "./content-log-empty";

interface ContentLogTableProps {
  logs: NsfwContentLog[];
}

export function ContentLogTable({ logs }: ContentLogTableProps) {
  // Utility function to format duration from seconds to minutes and seconds
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        {/* Table header with column titles */}
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
        
        {/* Table body with conditional rendering based on logs existence */}
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <ContentLogRow 
                key={log.id} 
                log={log} 
                formatDuration={formatDuration}
              />
            ))
          ) : (
            <ContentLogEmpty />
          )}
        </TableBody>
      </Table>
    </div>
  );
}
