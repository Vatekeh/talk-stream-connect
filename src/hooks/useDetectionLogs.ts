
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NsfwContentLog } from '@/types';

interface UseDetectionLogsProps {
  userId?: string;
  limit?: number;
  offset?: number;
}

export function useDetectionLogs({ 
  userId, 
  limit = 100, 
  offset = 0 
}: UseDetectionLogsProps = {}) {
  const [logs, setLogs] = useState<NsfwContentLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        let url = `${supabaseUrl}/functions/v1/detection-logs`;
        if (userId) {
          url += `?userId=${userId}`;
        }
        
        const { data: userToken } = await supabase.auth.getSession();
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${userToken?.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching logs: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform the detection logs to NsfwContentLog format
        const transformedLogs: NsfwContentLog[] = data.map((log: any) => ({
          id: log.id,
          userId: log.user_id,
          source: new URL(log.url).hostname || 'Unknown Source',
          pageTitle: log.details?.pageTitle || 'Unnamed Page',
          url: log.url,
          visitTimestamp: log.created_at,
          duration: log.details?.duration || 0, // in seconds
          category: mapDetectionTypeToCategory(log.detection_type),
          tags: log.details?.tags || [log.detection_type],
        }));
        
        setLogs(transformedLogs);
      } catch (err) {
        console.error('Failed to fetch detection logs:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userId, limit, offset]);

  return { logs, loading, error };
}

// Helper function to map detection_type to category
function mapDetectionTypeToCategory(detectionType: string): "image" | "video" | "text" | "other" {
  const lowerType = detectionType.toLowerCase();
  if (lowerType.includes('image') || lowerType.includes('nsfw')) {
    return 'image';
  } else if (lowerType.includes('video')) {
    return 'video';
  } else if (lowerType.includes('text') || lowerType.includes('spam') || lowerType.includes('harassment')) {
    return 'text';
  }
  return 'other';
}
