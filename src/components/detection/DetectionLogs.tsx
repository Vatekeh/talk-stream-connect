
import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Filter, RefreshCw } from "lucide-react";
import { DetectionLogEntry } from "@/services/DetectionService";
import { supabase } from "@/integrations/supabase/client";

interface DetectionLogsProps {
  userId?: string;
}

export function DetectionLogs({ userId }: DetectionLogsProps) {
  const [logs, setLogs] = useState<DetectionLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${supabase.functions.url}/detection-logs`;
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
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch detection logs:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const getDetectionTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'nsfw':
        return <Badge variant="destructive">{type}</Badge>;
      case 'harassment':
        return <Badge variant="destructive">{type}</Badge>;
      case 'spam':
        return <Badge>{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Detection Logs</CardTitle>
            <CardDescription>Recent content detection events</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLogs} 
            disabled={loading}
            className="flex gap-1"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {logs.length > 0 ? (
          <Table>
            <TableCaption>A list of recent detection logs</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Detection Type</TableHead>
                <TableHead className="hidden md:table-cell">URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.created_at ? formatDateTime(log.created_at) : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {getDetectionTypeBadge(log.detection_type)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {log.url}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(log.url, '_blank')}
                    >
                      <ExternalLink size={16} />
                      <span className="sr-only">Open</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-6">
            {loading ? (
              <p className="text-muted-foreground">Loading logs...</p>
            ) : (
              <p className="text-muted-foreground">No detection logs found</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
