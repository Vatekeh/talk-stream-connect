
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RoomSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function RoomSearch({ searchTerm, setSearchTerm }: RoomSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search rooms by name or topic..."
        className="pl-9"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
