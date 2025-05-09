
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Rocket, Wrench, Bug, Plus, Star, Trash2, Edit, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ChangelogItem {
  title?: string;
  items: string[];
}

interface ChangelogEntry {
  id: string;
  version: string;
  release_date: string;
  is_current: boolean;
  features: ChangelogItem[];
  improvements: ChangelogItem[];
  bug_fixes: ChangelogItem[];
  created_at: string;
  created_by: string;
}

export function ChangelogManager() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const { user } = useAuth();
  
  // Form state
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isCurrent, setIsCurrent] = useState(false);
  
  // Features, improvements, and bug fixes
  const [featuresText, setFeaturesText] = useState("");
  const [improvementsText, setImprovementsText] = useState("");
  const [bugFixesText, setBugFixesText] = useState("");
  
  useEffect(() => {
    fetchChangelogs();
  }, []);
  
  // Reset form state when dialog is closed or opened
  useEffect(() => {
    if (!dialogOpen) {
      resetForm();
    }
  }, [dialogOpen]);

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
    }
  }, [editingEntry]);
  
  const resetForm = () => {
    setVersion("");
    setReleaseDate(format(new Date(), "yyyy-MM-dd"));
    setIsCurrent(false);
    setFeaturesText("");
    setImprovementsText("");
    setBugFixesText("");
    setEditingEntry(null);
  };

  const fetchChangelogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('*')
        .order('release_date', { ascending: false });
      
      if (error) throw error;
      
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching changelog entries:", error);
      toast.error("Failed to load changelog entries");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format items for textarea
  const formatItemsForTextarea = (items: ChangelogItem[]) => {
    let result = "";
    
    items.forEach((section, i) => {
      if (section.title) {
        result += `## ${section.title}\n`;
      }
      
      section.items.forEach(item => {
        result += `- ${item}\n`;
      });
      
      if (i < items.length - 1) {
        result += "\n";
      }
    });
    
    return result;
  };
  
  // Parse textarea content into structured format
  const parseTextareaContent = (text: string): ChangelogItem[] => {
    const lines = text.trim().split('\n');
    const result: ChangelogItem[] = [];
    
    let currentSection: ChangelogItem = { items: [] };
    
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Check if this is a section title
      if (line.startsWith('## ')) {
        // If we already have items in the current section, save it
        if (currentSection.items.length > 0) {
          result.push({ ...currentSection });
        }
        
        // Start a new section
        const title = line.substring(3).trim();
        currentSection = { title, items: [] };
      } 
      // Check if this is a list item
      else if (line.startsWith('- ')) {
        currentSection.items.push(line.substring(2).trim());
      } 
      // Treat as regular text (probably a list item without the dash)
      else {
        currentSection.items.push(line);
      }
    });
    
    // Add the final section if it has items
    if (currentSection.items.length > 0) {
      result.push(currentSection);
    }
    
    // If there are no sections with titles but there are items, create a single section
    if (result.length === 0 && lines.length > 0) {
      const items = lines
        .filter(line => line.trim())
        .map(line => {
          if (line.startsWith('- ')) {
            return line.substring(2).trim();
          }
          return line.trim();
        });
      
      if (items.length > 0) {
        result.push({ items });
      }
    }
    
    return result.length > 0 ? result : [{ items: [] }];
  };

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
      
      const entryData = {
        version,
        release_date: releaseDate,
        is_current: isCurrent,
        features,
        improvements,
        bug_fixes,
        created_by: user?.id
      };
      
      // If is_current is true, update all other entries to false
      if (isCurrent) {
        const { error: updateError } = await supabase
          .from('changelog_entries')
          .update({ is_current: false })
          .neq('id', editingEntry?.id || '');
        
        if (updateError) throw updateError;
      }
      
      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('changelog_entries')
          .update(entryData)
          .eq('id', editingEntry.id);
          
        if (error) throw error;
        toast.success("Changelog entry updated!");
      } else {
        // Create new entry
        const { error } = await supabase
          .from('changelog_entries')
          .insert(entryData);
          
        if (error) throw error;
        toast.success("Changelog entry created!");
      }
      
      // Refresh the list and close the dialog
      fetchChangelogs();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving changelog entry:", error);
      toast.error("Failed to save changelog entry");
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this changelog entry?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('changelog_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Changelog entry deleted!");
      fetchChangelogs();
    } catch (error) {
      console.error("Error deleting changelog entry:", error);
      toast.error("Failed to delete changelog entry");
    }
  };
  
  const handleSetCurrent = async (id: string) => {
    try {
      // First, set all entries to not current
      const { error: updateAllError } = await supabase
        .from('changelog_entries')
        .update({ is_current: false })
        .neq('id', id);
        
      if (updateAllError) throw updateAllError;
      
      // Then set the selected entry to current
      const { error } = await supabase
        .from('changelog_entries')
        .update({ is_current: true })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Current version updated!");
      fetchChangelogs();
    } catch (error) {
      console.error("Error updating current version:", error);
      toast.error("Failed to update current version");
    }
  };
  
  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manage Changelog</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Version
            </Button>
          </DialogTrigger>
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                      onClick={() => handleEdit(entry)}
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
      )}
    </div>
  );
}
