
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ChangelogEntry } from "./changelog/types";
import { fetchChangelogs } from "./changelog/changelog-service";
import { ChangelogEntryDialog } from "./changelog/ChangelogEntryDialog";
import { ChangelogTable } from "./changelog/ChangelogTable";

export function ChangelogManager() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  
  useEffect(() => {
    loadChangelogs();
  }, []);
  
  // Reset editing entry when dialog is closed
  useEffect(() => {
    if (!dialogOpen) {
      setEditingEntry(null);
    }
  }, [dialogOpen]);

  const loadChangelogs = async () => {
    try {
      setLoading(true);
      const data = await fetchChangelogs();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching changelog entries:", error);
      toast.error("Failed to load changelog entries");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleAddVersion = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manage Changelog</h2>
        
        <Button className="flex items-center gap-2" onClick={handleAddVersion}>
          <Plus size={16} />
          Add Version
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-talkstream-purple border-t-transparent rounded-full"></div>
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No changelog entries found. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <ChangelogTable 
          entries={entries}
          onEdit={handleEdit}
          onDelete={loadChangelogs}
          onSetCurrent={loadChangelogs}
        />
      )}
      
      <ChangelogEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingEntry={editingEntry}
        onSuccess={loadChangelogs}
      />
    </div>
  );
}
