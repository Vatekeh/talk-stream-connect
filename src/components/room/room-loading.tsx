
import { AppHeader } from "@/components/layout/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export function RoomGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 rounded-xl bg-accent animate-pulse" />
      ))}
    </div>
  );
}

interface RoomLoadingProps {
  user: any | null;
}

export function RoomLoading({ user }: RoomLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isAuthenticated={!!user} 
        userName={user?.user_metadata?.name || user?.user_metadata?.username || "User"} 
      />
      <main className="flex-1 container flex flex-col py-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
