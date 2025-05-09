
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Rocket, Wrench, Bug } from "lucide-react";
import { format } from "date-fns";
import { ChangelogEntry } from "./types";
import { formatItemsForTextarea, parseTextareaContent } from "./utils";
import { updateChangelogEntry, createChangelogEntry, updateAllEntriesNotCurrent } from "./changelog-service";
import { toast } from "sonner";

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
  const { user } = useAuth();
  
  // Form state
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isCurrent, setIsCurrent] = useState(false);
  
  // Features, improvements, and bug fixes
  const [featuresText, setFeaturesText] = useState("");
  const [improvementsText, setImprovementsText] = useState("");
  const [bugFixesText, setBugFixesText] = useState("");
  
  // Set form values when editing an entry
  useEffect(() => {
    if (editingEntry) {
      setVersion(editingEntry.version);
      setReleaseDate(format(new Date(editingEntry.release_date), "yyyy-MM-dd"));
      setIsCurrent(editingEntry.is_current);
      
      // Convert JSON objects back to text
      setFeaturesText(formatItemsForTextarea(editingEntry.features));
      setImprovementsText(formatItemsForTextarea(editingEntry.improvements));
      setBugFixesText(formatItemsForTextarea(editingEntry.bug_fixes));
    } else {
      // Reset form for new entry
      setVersion("");
      setReleaseDate(format(new Date(), "yyyy-MM-dd"));
      setIsCurrent(false);
      setFeaturesText("");
      setImprovementsText("");
      setBugFixesText("");
    }
  }, [editingEntry, open]);

  const handleSubmit = async () => {
    if (!version || !releaseDate) {
      toast.error("Version and release date are required");
      return;
    }
    
    try {
      // Parse textarea content
      const features = parseTextareaContent(featuresText);
      const improvements = parseTextareaContent(improvementsText);
      const bug_fixes = parseTextareaContent(bugFixesText);
      
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
          features,
          improvements,
          bug_fixes
        });
        toast.success("Changelog entry updated!");
      } else {
        // Create new entry
        await createChangelogEntry({
          version,
          release_date: releaseDate,
          is_current: isCurrent,
          features,
          improvements,
          bug_fixes,
          created_by: user?.id || null
        });
        toast.success("Changelog entry created!");
      }
      
      // Refresh the list and close the dialog
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving changelog entry:", error);
      toast.error("Failed to save changelog entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Edit" : "Add"} Changelog Entry</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="version" className="text-sm font-medium">Version:</label>
              <Input
                id="version"
                placeholder="e.g. 1.5.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="release_date" className="text-sm font-medium">Release Date:</label>
              <div className="flex items-center gap-2">
                <Input
                  id="release_date"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  type="button" 
                  size="icon"
                  onClick={() => setReleaseDate(format(new Date(), "yyyy-MM-dd"))}
                >
                  <Calendar size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="mr-2"
              />
              Set as current release
            </label>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="features" className="text-sm font-medium flex items-center gap-1">
              <Rocket size={16} className="text-talkstream-purple" />
              New Features:
            </label>
            <Textarea
              id="features"
              placeholder="## Feature Name
- Feature detail 1
- Feature detail 2

## Another Feature
- Another feature detail"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="improvements" className="text-sm font-medium flex items-center gap-1">
              <Wrench size={16} className="text-blue-500" />
              Improvements:
            </label>
            <Textarea
              id="improvements"
              placeholder="## Improvement Area
- Detail 1
- Detail 2"
              value={improvementsText}
              onChange={(e) => setImprovementsText(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="bug_fixes" className="text-sm font-medium flex items-center gap-1">
              <Bug size={16} className="text-red-500" />
              Bug Fixes:
            </label>
            <Textarea
              id="bug_fixes"
              placeholder="- Fixed issue with X
- Resolved problem with Y"
              value={bugFixesText}
              onChange={(e) => setBugFixesText(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
