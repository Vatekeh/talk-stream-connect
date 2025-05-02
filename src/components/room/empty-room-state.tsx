
interface EmptyRoomStateProps {
  searchTerm: string;
  message?: string;
}

export function EmptyRoomState({ searchTerm, message }: EmptyRoomStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-xl font-medium">No rooms found</h2>
      <p className="text-muted-foreground">
        {searchTerm ? "Try a different search" : message || "Create a room to get started"}
      </p>
    </div>
  );
}
