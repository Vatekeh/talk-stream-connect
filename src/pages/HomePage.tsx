
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { CreateRoomDialog } from "@/components/room/create-room-dialog";
import { RoomCard } from "@/components/room/room-card";
import { CreateLiveKitRoomDialog } from "@/components/livekit/CreateRoomDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockRooms } from "@/lib/mock-data";
import { Room } from "@/types";

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  
  useEffect(() => {
    // This would be replaced with actual Supabase query
    setRooms(mockRooms);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={true} userName="Alex Johnson" isModerator={true} />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to TalkStream</h1>
            <p className="text-muted-foreground mt-1">Join or create a room to connect with others</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <CreateRoomDialog />
            <CreateLiveKitRoomDialog />
          </div>
        </div>
        
        <Tabs defaultValue="audio" className="space-y-6">
          <TabsList>
            <TabsTrigger value="audio">Audio Rooms</TabsTrigger>
            <TabsTrigger value="video">Video Rooms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="audio" className="space-y-4">
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No active rooms</h3>
                <p className="text-muted-foreground mb-6">Be the first to create a room and start the conversation!</p>
                <CreateRoomDialog />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Create a Video Room</h3>
              <p className="text-muted-foreground mb-6">Start a video meeting with your team or friends</p>
              <CreateLiveKitRoomDialog />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
