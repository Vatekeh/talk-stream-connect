
import { useState, useEffect } from 'react';
import { useDetectionLogs } from './useDetectionLogs';
import { useDetectionInsights } from './useDetectionInsights';
import { UserStats, UserStreak } from '@/types';

export function useUserStats(userId?: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { logs, loading: logsLoading, error: logsError } = useDetectionLogs({
    userId
  });
  
  const { insights, loading: insightsLoading } = useDetectionInsights({
    logs,
    loading: logsLoading
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        if (logsLoading || insightsLoading) return;

        // Calculate streak info based on logs
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = new Date(today - 86400000).getTime();

        // Sort logs by date
        const sortedLogs = [...logs].sort((a, b) => 
          new Date(b.visitTimestamp).getTime() - new Date(a.visitTimestamp).getTime()
        );

        // Calculate streak
        let currentStreak = 0;
        let lastLogDate: Date | null = null;
        
        if (sortedLogs.length === 0) {
          // No logs means the user is either new or has a perfect streak
          currentStreak = 7; // Default to 7 days for demo purposes
        } else {
          const latestLog = new Date(sortedLogs[0].visitTimestamp);
          const latestLogDay = new Date(
            latestLog.getFullYear(), 
            latestLog.getMonth(), 
            latestLog.getDate()
          ).getTime();

          // Check if latest log is from today or yesterday
          if (latestLogDay === today) {
            // The streak is broken today
            currentStreak = 0;
          } else {
            // Calculate days since last activity
            const daysSinceLastActivity = Math.floor((today - latestLogDay) / 86400000);
            
            // If user had no activity yesterday, streak continues
            currentStreak = daysSinceLastActivity;
            
            // Cap streak at 100 days for display purposes
            if (currentStreak > 100) currentStreak = 100;
          }
        }

        // Create user stats from insights
        const newStats: UserStats = {
          timeInRooms: Math.round(insights?.totalDuration / 60) || 0, // convert seconds to minutes
          roomsJoined: insights?.topSources.length || 0,
          messagesPosted: insights?.totalVisits || 0,
          weeklyActivity: generateWeeklyActivity(logs),
          monthlyActivity: generateMonthlyActivity(logs)
        };

        // Create streak info
        const newStreak: UserStreak = {
          current: currentStreak,
          longest: Math.max(currentStreak, 14), // For demo, assume longest streak was at least 14 days
          lastUpdated: new Date().toISOString()
        };

        setStats(newStats);
        setStreak(newStreak);
        setLoading(false);
      } catch (err) {
        console.error("Error processing user stats:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    calculateStats();
  }, [logs, logsLoading, insightsLoading]);

  return { stats, streak, loading, error };
}

// Helper function to generate weekly activity data
function generateWeeklyActivity(logs: any[]) {
  const result = [];
  const now = new Date();
  
  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter logs for this date
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.visitTimestamp);
      return logDate.toISOString().split('T')[0] === dateStr;
    });
    
    // Calculate total duration for the day in minutes
    const duration = dayLogs.reduce((sum, log) => sum + Math.round(log.duration / 60), 0);
    
    result.push({
      date: dateStr,
      duration: duration
    });
  }
  
  return result;
}

// Helper function to generate monthly activity data
function generateMonthlyActivity(logs: any[]) {
  const result = [];
  const now = new Date();
  
  // Generate last 30 days in 5-day groups
  for (let i = 5; i >= 0; i--) {
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - (i * 5));
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 4);
    
    const dateStr = startDate.toISOString().split('T')[0];
    
    // Filter logs for this date range
    const rangeLogs = logs.filter(log => {
      const logDate = new Date(log.visitTimestamp);
      return logDate >= startDate && logDate <= endDate;
    });
    
    // Calculate total duration for the range in minutes
    const duration = rangeLogs.reduce((sum, log) => sum + Math.round(log.duration / 60), 0);
    
    result.push({
      date: dateStr,
      duration: duration
    });
  }
  
  return result;
}
