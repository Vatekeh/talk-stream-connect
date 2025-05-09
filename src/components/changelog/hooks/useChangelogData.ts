
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChangelogEntry, SupabaseChangelogEntry } from "@/components/moderation/changelog/types";
import { parseJsonField } from "@/components/moderation/changelog/utils";

export function useChangelogData() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
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

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const getCurrentEntry = () => {
    const current = entries.find(entry => entry.is_current);
    return current || (entries.length > 0 ? entries[0] : null);
  };

  return {
    entries,
    loading,
    error,
    fetchChangelogs,
    getCurrentEntry
  };
}
