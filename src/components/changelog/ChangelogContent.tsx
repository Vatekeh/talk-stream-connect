
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChangelogEntry } from "@/components/moderation/changelog/types";
import { ChangelogEntrySection } from "./ChangelogEntrySection";
import { UserFeedbackSection } from "./UserFeedbackSection";
import { supabase } from "@/integrations/supabase/client";
import { parseJsonField } from "@/components/moderation/changelog/utils";
import { SupabaseChangelogEntry } from "@/components/moderation/changelog/types";

export const ChangelogContent = () => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    fetchChangelogs();
  }, []);
  
  const fetchChangelogs = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('*')
        .order('release_date', { ascending: false });
      
      if (error) throw error;
      
      // Parse JSON fields from Supabase
      const parsedEntries: ChangelogEntry[] = (data || []).map((entry: SupabaseChangelogEntry) => ({
        ...entry,
        is_current: entry.is_current || false,
        created_by: entry.created_by || '',
        created_at: entry.created_at || '',
        features: parseJsonField(entry.features),
        improvements: parseJsonField(entry.improvements),
        bug_fixes: parseJsonField(entry.bug_fixes)
      }));
      
      setEntries(parsedEntries);
    } catch (err) {
      console.error("Error fetching changelog entries:", err);
      setError(true);
      toast.error("Failed to load changelog entries");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentEntry = () => {
    const current = entries.find(entry => entry.is_current);
    return current || (entries.length > 0 ? entries[0] : null);
  };
  
  const currentEntry = getCurrentEntry();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-talkstream-purple" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-500">Failed to load changelog data</p>
        <Button className="mt-4" onClick={fetchChangelogs}>Try Again</Button>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">No changelog entries available</p>
      </div>
    );
  }

  return (
    <>
      {/* Current Update */}
      {currentEntry && <ChangelogEntrySection entry={currentEntry} isCurrent={true} />}
      
      {/* Previous Updates */}
      {entries
        .filter(entry => !entry.is_current)
        .map(entry => (
          <ChangelogEntrySection key={entry.id} entry={entry} />
        ))}
      
      {/* User Feedback Section */}
      <UserFeedbackSection />
    </>
  );
};
