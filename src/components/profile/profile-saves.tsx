
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import { Save } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ProfileSavesProps {
  saves: Save[];
}

export function ProfileSaves({ saves }: ProfileSavesProps) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saves Received</CardTitle>
              <CardDescription>
                People who appreciate your help
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
              <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
              <span className="text-xl font-bold">{saves.length}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {saves.length > 0 ? (
            <div className="space-y-4">
              {saves.map((save) => (
                <div 
                  key={save.id} 
                  className="flex gap-4 p-4 rounded-lg border"
                >
                  <Avatar>
                    <AvatarImage src={save.fromUserAvatar} alt={save.fromUserName} />
                    <AvatarFallback className="bg-talkstream-purple text-white">
                      {save.fromUserName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{save.fromUserName}</span>
                      <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                    </div>
                    <p className="mt-1">{save.message}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(save.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No saves yet</h3>
              <p className="text-muted-foreground mt-1">
                Help others in conversations to receive saves
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
