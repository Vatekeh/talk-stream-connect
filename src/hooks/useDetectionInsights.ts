
import { useState, useEffect, useMemo } from 'react';
import { NsfwContentLog, NsfwUserInsights, NsfwSourceSummary, NsfwTimePattern } from '@/types';

interface UseDetectionInsightsProps {
  logs: NsfwContentLog[];
  loading: boolean;
}

export function useDetectionInsights({ logs, loading }: UseDetectionInsightsProps) {
  const [insights, setInsights] = useState<NsfwUserInsights | null>(null);
  const [processingInsights, setProcessingInsights] = useState<boolean>(true);

  useEffect(() => {
    if (!loading && logs.length > 0) {
      setProcessingInsights(true);
      
      // Process the logs to generate insights
      try {
        // Calculate source summaries
        const sourceMap = new Map<string, { 
          visitCount: number; 
          totalDuration: number; 
          lastVisit: string;
        }>();

        logs.forEach(log => {
          const source = log.source;
          const current = sourceMap.get(source) || { 
            visitCount: 0, 
            totalDuration: 0, 
            lastVisit: log.visitTimestamp 
          };
          
          sourceMap.set(source, {
            visitCount: current.visitCount + 1,
            totalDuration: current.totalDuration + log.duration,
            lastVisit: new Date(log.visitTimestamp) > new Date(current.lastVisit) 
              ? log.visitTimestamp 
              : current.lastVisit
          });
        });

        const topSources: NsfwSourceSummary[] = Array.from(sourceMap.entries()).map(([source, data]) => ({
          source,
          visitCount: data.visitCount,
          totalDuration: data.totalDuration,
          lastVisit: data.lastVisit
        })).sort((a, b) => b.visitCount - a.visitCount);

        // Calculate time patterns
        const timePatterns: NsfwTimePattern[] = calculateTimePatterns(logs);

        // Calculate totals and averages
        const totalVisits = logs.length;
        const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
        const averageDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

        // Create insights object
        const newInsights: NsfwUserInsights = {
          topSources,
          recentLogs: logs.slice(0, 3),
          timePatterns,
          totalVisits,
          totalDuration,
          averageDuration
        };

        setInsights(newInsights);
      } catch (error) {
        console.error('Error processing detection insights:', error);
      } finally {
        setProcessingInsights(false);
      }
    } else if (!loading && logs.length === 0) {
      // Create empty insights object if no logs
      setInsights({
        topSources: [],
        recentLogs: [],
        timePatterns: generateEmptyTimePatterns(),
        totalVisits: 0,
        totalDuration: 0,
        averageDuration: 0
      });
      setProcessingInsights(false);
    }
  }, [logs, loading]);

  return { insights, loading: loading || processingInsights };
}

// Helper function to generate time patterns from logs
function calculateTimePatterns(logs: NsfwContentLog[]): NsfwTimePattern[] {
  // Create a map to count visits by hour and day of week
  const timeMap = new Map<string, number>();
  
  logs.forEach(log => {
    const date = new Date(log.visitTimestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const key = `${hour}:${dayOfWeek}`;
    
    timeMap.set(key, (timeMap.get(key) || 0) + 1);
  });
  
  // Convert map to array of time patterns
  const patterns: NsfwTimePattern[] = [];
  
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${hour}:${dayOfWeek}`;
      patterns.push({
        hour,
        dayOfWeek,
        visitCount: timeMap.get(key) || 0
      });
    }
  }
  
  return patterns;
}

// Helper function to generate empty time patterns
function generateEmptyTimePatterns(): NsfwTimePattern[] {
  const patterns: NsfwTimePattern[] = [];
  
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    for (let hour = 0; hour < 24; hour++) {
      patterns.push({
        hour,
        dayOfWeek,
        visitCount: 0
      });
    }
  }
  
  return patterns;
}
