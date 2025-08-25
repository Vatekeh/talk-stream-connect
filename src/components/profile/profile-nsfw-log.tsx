import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContentLogTable } from "./log/content-log-table";

interface ProfileNsfwLogProps {
  logs: any[];
  loading: boolean;
}

export function ProfileNsfwLog({ logs, loading }: ProfileNsfwLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Detection Log</CardTitle>
        <CardDescription>
          Recent content detection events from your activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <ContentLogTable logs={logs} />
        ) : (
          <div className="text-center p-12 border rounded-md bg-background">
            <p className="text-muted-foreground mb-2">No content logs found</p>
            <p className="text-sm text-muted-foreground">
              Content detection data will appear here when you use the Chrome extension.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
