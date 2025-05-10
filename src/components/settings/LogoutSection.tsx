
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";

export function LogoutSection() {
  const { signOut } = useAuth();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-clutsh-midnight/95 to-transparent pt-12">
      <div className="container max-w-md mx-auto">
        <Button 
          variant="outline"
          className="w-full py-6 text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          onClick={signOut}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
