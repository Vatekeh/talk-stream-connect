
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff } from "lucide-react";

interface RoomStageProps {
  speakers: User[];
  remoteUsers: any[];
}

export function RoomStage({ speakers, remoteUsers }: RoomStageProps) {
  // Extract the hostId from the first speaker if available
  const hostId = speakers.length > 0 ? speakers.find(s => s.hostId)?.id : undefined;
  
  return (
    <div className="h-full p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Active Stage</h2>
      
      {speakers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center flex-col text-center">
          <div className="p-6 bg-muted/30 rounded-lg mb-3">
            <Mic className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No active speakers</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Speakers will appear here when they join the stage
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="bg-muted/20 p-4 rounded-lg flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage src={speaker.avatar} alt={speaker.name || "Speaker"} />
                <AvatarFallback className="text-xl">
                  {speaker.name ? speaker.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-lg">{speaker.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {speaker.id === hostId ? "Host" : "Speaker"}
              </p>
              <div className="text-sm flex items-center gap-1">
                {speaker.isMuted ? (
                  <>
                    <MicOff className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Muted</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3 text-primary" />
                    <span>Speaking</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
