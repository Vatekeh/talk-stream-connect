
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NsfwContentLog } from '@/types';
import { toast } from 'sonner';
import { safePostToApi } from '@/integrations/supabase/api-utils';

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
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.access_token) {
          throw new Error('No authenticated session found');
        }
        
        // Use the full Supabase function URL with project ID
        const functionUrl = 'https://ggbvhsuuwqwjghxpuapg.functions.supabase.co/detection-logs';
        console.log('Fetching detection logs from:', functionUrl);
        
        // Add userId as a query parameter if provided
        const url = userId ? `${functionUrl}?userId=${userId}` : functionUrl;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', response.status, errorText);
          throw new Error(`Error fetching logs: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Unexpected response format. Content-Type:', contentType, 'Response:', text.substring(0, 200));
          throw new Error('Server did not return JSON. Received: ' + contentType);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error('Unexpected response format:', data);
          throw new Error('Received invalid response format from server');
        }
        
        // Transform the detection logs to NsfwContentLog format
        const transformedLogs: NsfwContentLog[] = data.map((log: any) => ({
          id: log.id,
          userId: log.user_id,
          source: log.url ? new URL(log.url).hostname || 'Unknown Source' : 'Unknown Source',
          pageTitle: log.details?.pageTitle || 'Unnamed Page',
          url: log.url || '',
          visitTimestamp: log.created_at,
          duration: log.details?.duration || 0, // in seconds
          category: mapDetectionTypeToCategory(log.detection_type),
          tags: log.details?.tags || [log.detection_type],
        }));
        
        setLogs(transformedLogs);
      } catch (err) {
        console.error('Failed to fetch detection logs:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLogs([]); // Reset logs on error
        toast.error('Failed to load detection logs. Please try again later.');
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
  if (!detectionType) return 'other';
  
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
