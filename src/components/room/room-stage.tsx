
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface RoomStageProps {
  speakers: User[];
  remoteUsers: any[];
}

export function RoomStage({ speakers, remoteUsers }: RoomStageProps) {
  const isMobile = useIsMobile();
  
  // The error is here - hostId doesn't exist on User type
  // Let's fix by looking for a user that is marked as a host in another way
  const hostId = speakers.length > 0 ? speakers.find(s => s.isCreator)?.id : undefined;
  
  return (
    <div className="h-full p-3 md:p-6 flex flex-col">
      <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Active Stage</h2>
      
      {speakers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center flex-col text-center">
          <div className="p-4 md:p-6 bg-muted/30 rounded-lg mb-2 md:mb-3">
            <Mic className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-base md:text-lg font-medium">No active speakers</h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Speakers will appear here when they join the stage
          </p>
        </div>
      ) : (
        <div className={`flex-1 grid gap-2 md:gap-4 ${isMobile 
          ? speakers.length === 1 
            ? 'grid-cols-1 place-items-center' 
            : 'grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
        >
          {speakers.map((speaker) => (
            <div 
              key={speaker.id} 
              className={`bg-muted/20 p-3 md:p-4 rounded-lg flex flex-col items-center ${
                isMobile && speakers.length === 1 ? 'w-64 h-64' : ''
              }`}
            >
              <Avatar className={`mb-2 md:mb-3 ${
                isMobile && speakers.length === 1 ? 'h-32 w-32' : 'h-20 w-20 md:h-24 md:w-24'
              }`}>
                <AvatarImage src={speaker.avatar} alt={speaker.name || "Speaker"} />
                <AvatarFallback className="text-xl">
                  {speaker.name ? speaker.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-base md:text-lg">{speaker.name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
                {speaker.id === hostId ? "Host" : "Speaker"}
              </p>
              <div className="text-xs md:text-sm flex items-center gap-1">
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
