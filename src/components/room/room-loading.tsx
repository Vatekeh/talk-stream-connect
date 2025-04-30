
import { AppHeader } from "@/components/layout/app-header";

interface RoomLoadingProps {
  user: any | null;
}

export function RoomLoading({ user }: RoomLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={!!user} 
        userName={user?.user_metadata?.name || "User"} 
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    </div>
  );
}
