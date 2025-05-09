
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  Wrench, 
  Bug, 
  Calendar, 
  ChevronRight, 
  Pin, 
  Mail,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

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

interface SupabaseChangelogEntry {
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

export default function ChangelogPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    fetchChangelogs();
  }, []);

  // Helper function to parse JSON fields
  const parseJsonField = (field: Json): ChangelogItem[] => {
    if (!field) return [{ items: [] }];
    
    try {
      if (typeof field === 'string') {
        return JSON.parse(field) as ChangelogItem[];
      }
      // Handle the case where field is already an array (from Supabase)
      if (Array.isArray(field)) {
        // Ensure each item in the array conforms to ChangelogItem structure
        return field.map((item: any) => {
          if (typeof item === 'object' && 'items' in item) {
            return item as ChangelogItem;
          }
          return { items: Array.isArray(item) ? item : [String(item)] };
        });
      }
      return [{ items: [] }];
    } catch (e) {
      console.error('Failed to parse JSON field:', e);
      return [{ items: [] }];
    }
  };
  
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
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return dateString;
    }
  };
  
  const getCurrentEntry = () => {
    const current = entries.find(entry => entry.is_current);
    return current || (entries.length > 0 ? entries[0] : null);
  };
  
  const currentEntry = getCurrentEntry();
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={!!user} 
        userName={user?.user_metadata?.name || user?.email?.split('@')[0] || "Guest User"} 
        userAvatar={user?.user_metadata?.avatar_url}
        isModerator={user?.user_metadata?.is_moderator}
      />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Changelog & Release Notes</h1>
            <div className="flex gap-2">
              {user && user.user_metadata?.is_moderator && (
                <Button asChild>
                  <Link to="/moderation?tab=changelog">Manage Changelog</Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <div className="border-b border-border pb-4 mb-8">
              <p className="text-lg">
                This page documents comprehensive updates, features, improvements, and bug fixes across Clutsh's development lifecycle.
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-talkstream-purple" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-lg text-red-500">Failed to load changelog data</p>
                <Button className="mt-4" onClick={fetchChangelogs}>Try Again</Button>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">No changelog entries available</p>
              </div>
            ) : (
              <>
                {/* Current Update */}
                {currentEntry && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                      <Pin className="text-talkstream-purple h-5 w-5" />
                      <h2 className="text-2xl font-semibold" id={`v${currentEntry.version}`}>
                        [{currentEntry.version}] - {formatDate(currentEntry.release_date)} <span className="text-sm bg-talkstream-purple/10 text-talkstream-purple px-2 py-1 rounded-md">Current Update</span>
                      </h2>
                    </div>
                    
                    {currentEntry.features.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Rocket className="text-talkstream-purple h-4 w-4" />
                          <h3 className="text-xl font-medium">New Features</h3>
                        </div>
                        <div className="pl-6 border-l border-border ml-2">
                          {currentEntry.features.map((section, i) => (
                            <div key={i} className="mb-3">
                              {section.title && (
                                <h4 className="font-medium mb-1">{section.title}</h4>
                              )}
                              <ul className="list-disc pl-6 mb-3">
                                {section.items.map((item, j) => (
                                  <li key={j} className="mb-1">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {currentEntry.improvements.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="text-blue-500 h-4 w-4" />
                          <h3 className="text-xl font-medium">Improvements & Refactoring</h3>
                        </div>
                        <div className="pl-6 border-l border-border ml-2">
                          {currentEntry.improvements.map((section, i) => (
                            <div key={i} className="mb-3">
                              {section.title && (
                                <h4 className="font-medium mb-1">{section.title}</h4>
                              )}
                              <ul className="list-disc pl-6 mb-3">
                                {section.items.map((item, j) => (
                                  <li key={j} className="mb-1">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {currentEntry.bug_fixes.length > 0 && currentEntry.bug_fixes[0].items.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Bug className="text-red-500 h-4 w-4" />
                          <h3 className="text-xl font-medium">Bug Fixes</h3>
                        </div>
                        <div className="pl-6 border-l border-border ml-2">
                          {currentEntry.bug_fixes.map((section, i) => (
                            <div key={i}>
                              {section.title && (
                                <h4 className="font-medium mb-1">{section.title}</h4>
                              )}
                              <ul className="list-disc pl-6">
                                {section.items.map((item, j) => (
                                  <li key={j} className="mb-1">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Previous Updates */}
                {entries
                  .filter(entry => !entry.is_current)
                  .map(entry => (
                    <div className="mb-12" key={entry.id}>
                      <div className="flex items-center gap-2 mb-4">
                        <Pin className="text-gray-500 h-5 w-5" />
                        <h2 className="text-2xl font-semibold" id={`v${entry.version}`}>
                          [{entry.version}] - {formatDate(entry.release_date)}
                          {entry.version === "1.0.0" && (
                            <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-md ml-2">
                              Initial Release 🎉
                            </span>
                          )}
                        </h2>
                      </div>
                      
                      {entry.features.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Rocket className="text-talkstream-purple h-4 w-4" />
                            <h3 className="text-xl font-medium">
                              {entry.version === "1.0.0" ? "Core Features" : "New Features"}
                            </h3>
                          </div>
                          <div className="pl-6 border-l border-border ml-2">
                            {entry.features.map((section, i) => (
                              <div key={i} className="mb-3">
                                {section.title && (
                                  <h4 className="font-medium mb-1">{section.title}</h4>
                                )}
                                <ul className="list-disc pl-6 mb-3">
                                  {section.items.map((item, j) => (
                                    <li key={j} className="mb-1">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {entry.improvements.length > 0 && entry.improvements[0].items.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="text-blue-500 h-4 w-4" />
                            <h3 className="text-xl font-medium">Improvements</h3>
                          </div>
                          <div className="pl-6 border-l border-border ml-2">
                            {entry.improvements.map((section, i) => (
                              <div key={i}>
                                {section.title && (
                                  <h4 className="font-medium mb-1">{section.title}</h4>
                                )}
                                <ul className="list-disc pl-6">
                                  {section.items.map((item, j) => (
                                    <li key={j} className="mb-1">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {entry.bug_fixes.length > 0 && entry.bug_fixes[0].items.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Bug className="text-red-500 h-4 w-4" />
                            <h3 className="text-xl font-medium">Bug Fixes</h3>
                          </div>
                          <div className="pl-6 border-l border-border ml-2">
                            {entry.bug_fixes.map((section, i) => (
                              <div key={i}>
                                {section.title && (
                                  <h4 className="font-medium mb-1">{section.title}</h4>
                                )}
                                <ul className="list-disc pl-6">
                                  {section.items.map((item, j) => (
                                    <li key={j} className="mb-1">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                
                {/* User Feedback Section */}
                <div className="mb-8 bg-muted p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">User Feedback & Requests</h2>
                  </div>
                  <p className="mb-2">Your feedback helps us grow! Send your suggestions or report issues to:</p>
                  <a href="mailto:feedback@clutsh.app" className="text-talkstream-purple hover:underline">
                    feedback@clutsh.app
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Clutsh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
