
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChangelogEntry } from "./types";
import { ChangelogEntryForm } from "./form/ChangelogEntryForm";
import { useChangelogEntrySubmit } from "./hooks/useChangelogEntrySubmit";

interface ChangelogEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry: ChangelogEntry | null;
  onSuccess: () => void;
}

export function ChangelogEntryDialog({
  open,
  onOpenChange,
  editingEntry,
  onSuccess
}: ChangelogEntryDialogProps) {
  const { handleSubmit } = useChangelogEntrySubmit({
    editingEntry,
    onSuccess,
    onCloseDialog: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Edit" : "Add"} Changelog Entry</DialogTitle>
        </DialogHeader>
        
        <ChangelogEntryForm
          editingEntry={editingEntry}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
