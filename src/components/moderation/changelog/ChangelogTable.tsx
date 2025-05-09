
import { format } from "date-fns";
import { Edit, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChangelogEntry } from "./types";
import { toast } from "sonner";
import { deleteChangelogEntry, setCurrentChangelogEntry } from "./changelog-service";

interface ChangelogTableProps {
  entries: ChangelogEntry[];
  onEdit: (entry: ChangelogEntry) => void;
  onDelete: () => void;
  onSetCurrent: () => void;
}

export function ChangelogTable({ 
  entries, 
  onEdit, 
  onDelete,
  onSetCurrent
}: ChangelogTableProps) {
  
  const handleSetCurrent = async (id: string) => {
    try {
      await setCurrentChangelogEntry(id);
      toast.success("Current version updated!");
      onSetCurrent();
    } catch (error) {
      console.error("Error updating current version:", error);
      toast.error("Failed to update current version");
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this changelog entry?")) {
      return;
    }
    
    try {
      await deleteChangelogEntry(id);
      toast.success("Changelog entry deleted!");
      onDelete();
    } catch (error) {
      console.error("Error deleting changelog entry:", error);
      toast.error("Failed to delete changelog entry");
    }
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Version</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium">{entry.version}</TableCell>
            <TableCell>
              {format(new Date(entry.release_date), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              {entry.is_current && (
                <Badge className="bg-talkstream-purple">Current</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {!entry.is_current && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleSetCurrent(entry.id)}
                    title="Set as current version"
                  >
                    <Star size={16} />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEdit(entry)}
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
