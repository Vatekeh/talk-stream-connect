
import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { CreateRoomDialog } from "@/components/room/create-room-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomSearch } from "@/components/room/room-search";
import { RoomGrid } from "@/components/room/room-grid";
import { RoomGridSkeleton } from "@/components/room/room-loading";
import { useHomeRooms } from "@/hooks/use-home-rooms";
import { EmptyRoomState } from "@/components/room/empty-room-state";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  const { createdRooms, joinedRooms, isLoading, filterRooms } = useHomeRooms(user?.id);
  
  // Filter rooms by search term
  const filteredCreatedRooms = filterRooms(createdRooms, searchTerm);
  const filteredJoinedRooms = filterRooms(joinedRooms, searchTerm);
  
  const hasRooms = filteredCreatedRooms.length > 0 || filteredJoinedRooms.length > 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Explore Rooms</h1>
              <p className="text-muted-foreground">Join live conversations</p>
            </div>
            <CreateRoomDialog />
          </div>
          
          <RoomSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          {isLoading ? (
            <RoomGridSkeleton />
          ) : hasRooms ? (
            <Tabs defaultValue="created" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="created">My Created Rooms</TabsTrigger>
                <TabsTrigger value="joined">My Joined Rooms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="created">
                <RoomGrid 
                  rooms={filteredCreatedRooms} 
                  searchTerm={searchTerm} 
                  emptyMessage="Create a room to get started" 
                  isCreated={true} 
                />
              </TabsContent>
              
              <TabsContent value="joined">
                <RoomGrid 
                  rooms={filteredJoinedRooms} 
                  searchTerm={searchTerm} 
                  emptyMessage="Join a room to see it here" 
                  isCreated={false} 
                />
              </TabsContent>
            </Tabs>
          ) : (
            <EmptyRoomState searchTerm={searchTerm} />
          )}
        </div>
      </main>
    </div>
  );
}
