
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChangelogEntry } from "../types";
import { parseTextareaContent } from "../utils";
import { updateChangelogEntry, createChangelogEntry, updateAllEntriesNotCurrent } from "../changelog-service";

interface UseChangelogEntrySubmitProps {
  editingEntry: ChangelogEntry | null;
  onSuccess: () => void;
  onCloseDialog: () => void;
}

interface FormData {
  version: string;
  releaseDate: string;
  isCurrent: boolean;
  features: string;
  improvements: string;
  bugFixes: string;
}

export function useChangelogEntrySubmit({
  editingEntry,
  onSuccess,
  onCloseDialog
}: UseChangelogEntrySubmitProps) {
  const { user } = useAuth();
  
  const handleSubmit = async (formData: FormData) => {
    const { version, releaseDate, isCurrent, features, improvements, bugFixes } = formData;
    
    if (!version || !releaseDate) {
      toast.error("Version and release date are required");
      return;
    }
    
    try {
      // Parse textarea content
      const parsedFeatures = parseTextareaContent(features);
      const parsedImprovements = parseTextareaContent(improvements);
      const parsedBugFixes = parseTextareaContent(bugFixes);
      
      // If is_current is true, update all other entries to false
      if (isCurrent && editingEntry) {
        await updateAllEntriesNotCurrent(editingEntry.id);
      } else if (isCurrent) {
        await updateAllEntriesNotCurrent('');
      }
      
      if (editingEntry) {
        // Update existing entry
        await updateChangelogEntry(editingEntry.id, {
          version,
          release_date: releaseDate,
          is_current: isCurrent,
          features: parsedFeatures,
          improvements: parsedImprovements,
          bug_fixes: parsedBugFixes
        });
        toast.success("Changelog entry updated!");
      } else {
        // Create new entry
        await createChangelogEntry({
          version,
          release_date: releaseDate,
          is_current: isCurrent,
          features: parsedFeatures,
          improvements: parsedImprovements,
          bug_fixes: parsedBugFixes,
          created_by: user?.id || null
        });
        toast.success("Changelog entry created!");
      }
      
      // Refresh the list and close the dialog
      onSuccess();
      onCloseDialog();
    } catch (error) {
      console.error("Error saving changelog entry:", error);
      toast.error("Failed to save changelog entry");
    }
  };

  return { handleSubmit };
}
