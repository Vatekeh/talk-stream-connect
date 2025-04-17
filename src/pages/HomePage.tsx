
import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { RoomCard } from "@/components/room/room-card";
import { mockRooms } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // This would be replaced with actual Supabase query
  const filteredRooms = mockRooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.name.toLowerCase().includes(searchLower) ||
      (room.description?.toLowerCase().includes(searchLower)) ||
      (room.topic?.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={true} userName="Alex Johnson" isModerator={true} />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">Explore Rooms</h1>
            <p className="text-muted-foreground">Join live conversations</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rooms by name or topic..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-xl font-medium">No rooms found</h2>
              <p className="text-muted-foreground">
                Try a different search
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

