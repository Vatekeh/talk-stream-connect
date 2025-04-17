
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Film, Clock, Trash2 } from "lucide-react";
import { Clip } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ProfileClipsProps {
  clips: Clip[];
}

export function ProfileClips({ clips }: ProfileClipsProps) {
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Your Clips</CardTitle>
              <CardDescription>
                Memorable moments from rooms you've joined
              </CardDescription>
            </div>
            <Button size="sm">
              <Film className="mr-2 h-4 w-4" />
              Create New Clip
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {clips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clips.map((clip) => (
                <div 
                  key={clip.id} 
                  className="flex flex-col border rounded-lg overflow-hidden"
                >
                  <div className="bg-muted aspect-video relative flex items-center justify-center">
                    {clip.thumbnailUrl ? (
                      <img 
                        src={clip.thumbnailUrl} 
                        alt={clip.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="h-12 w-12 text-muted-foreground/50" />
                    )}
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="absolute"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-medium text-lg">{clip.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1">
                      {clip.description || `From room: ${clip.roomName}`}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(clip.duration)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No clips yet</h3>
              <p className="text-muted-foreground mt-1">
                Create clips from interesting moments in rooms
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
