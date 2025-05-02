
import { Room } from "@/types";
import { RoomCard } from "./room-card";
import { EmptyRoomState } from "./empty-room-state";

interface RoomGridProps {
  rooms: Room[];
  searchTerm: string;
  emptyMessage?: string;
  isCreated?: boolean;
}

export function RoomGrid({ rooms, searchTerm, emptyMessage, isCreated = false }: RoomGridProps) {
  if (rooms.length === 0) {
    return <EmptyRoomState searchTerm={searchTerm} message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} isCreated={isCreated} />
      ))}
    </div>
  );
}
