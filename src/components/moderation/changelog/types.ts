
import { Json } from "@/integrations/supabase/types";

export interface ChangelogItem {
  title?: string;
  items: string[];
}

export interface ChangelogEntry {
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

export interface SupabaseChangelogEntry {
  id: string;
  version: string;
  release_date: string;
  is_current: boolean | null;
  features: Json;
  improvements: Json;
  bug_fixes: Json;
  created_at: string | null;
  created_by: string | null;
}
