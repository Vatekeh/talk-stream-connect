
import { supabase } from "@/integrations/supabase/client";
import { ChangelogEntry, SupabaseChangelogEntry } from "./types";
import { parseJsonField } from "./utils";
import { Json } from "@/integrations/supabase/types";

export async function fetchChangelogs(): Promise<ChangelogEntry[]> {
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
  
  return parsedEntries;
}

export async function updateAllEntriesNotCurrent(exceptId: string): Promise<void> {
  const { error } = await supabase
    .from('changelog_entries')
    .update({ is_current: false })
    .neq('id', exceptId);
    
  if (error) throw error;
}

export async function updateChangelogEntry(
  id: string, 
  data: {
    version: string;
    release_date: string;
    is_current: boolean;
    features: ChangelogItem[];
    improvements: ChangelogItem[];
    bug_fixes: ChangelogItem[];
  }
): Promise<void> {
  const { error } = await supabase
    .from('changelog_entries')
    .update({
      version: data.version,
      release_date: data.release_date,
      is_current: data.is_current,
      features: data.features as unknown as Json,
      improvements: data.improvements as unknown as Json,
      bug_fixes: data.bug_fixes as unknown as Json
    })
    .eq('id', id);
    
  if (error) throw error;
}

export async function createChangelogEntry(
  data: {
    version: string;
    release_date: string;
    is_current: boolean;
    features: ChangelogItem[];
    improvements: ChangelogItem[];
    bug_fixes: ChangelogItem[];
    created_by: string | null;
  }
): Promise<void> {
  const { error } = await supabase
    .from('changelog_entries')
    .insert({
      version: data.version,
      release_date: data.release_date,
      is_current: data.is_current,
      features: data.features as unknown as Json,
      improvements: data.improvements as unknown as Json,
      bug_fixes: data.bug_fixes as unknown as Json,
      created_by: data.created_by
    });
    
  if (error) throw error;
}

export async function deleteChangelogEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('changelog_entries')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

export async function setCurrentChangelogEntry(id: string): Promise<void> {
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
}
