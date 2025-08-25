import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShieldAlert, DollarSign, History, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const isModerator = user?.user_metadata?.is_moderator;

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-clutsh-light hover:bg-clutsh-steel"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-80 bg-clutsh-midnight border-clutsh-slate"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between py-4 border-b border-clutsh-slate">
            <h2 className="text-lg font-semibold text-clutsh-light">Navigation</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeSheet}
              className="text-clutsh-light hover:bg-clutsh-steel"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 py-6">
            <div className="space-y-2">
              <Link 
                to="/" 
                onClick={closeSheet}
                className="flex items-center gap-3 px-3 py-3 text-clutsh-light hover:bg-clutsh-slate/50 rounded-lg transition-colors"
              >
                <Home size={20} />
                <span className="font-medium">Home</span>
              </Link>
              
              {isModerator && (
                <Link 
                  to="/moderation" 
                  onClick={closeSheet}
                  className="flex items-center gap-3 px-3 py-3 text-clutsh-light hover:bg-clutsh-slate/50 rounded-lg transition-colors"
                >
                  <ShieldAlert size={20} />
                  <span className="font-medium">Moderation</span>
                </Link>
              )}
              
              <Link 
                to="/pricing" 
                onClick={closeSheet}
                className="flex items-center gap-3 px-3 py-3 text-clutsh-light hover:bg-clutsh-slate/50 rounded-lg transition-colors"
              >
                <DollarSign size={20} />
                <span className="font-medium">Pricing</span>
              </Link>
              
              <Link 
                to="/changelog" 
                onClick={closeSheet}
                className="flex items-center gap-3 px-3 py-3 text-clutsh-light hover:bg-clutsh-slate/50 rounded-lg transition-colors"
              >
                <History size={20} />
                <span className="font-medium">Changelog</span>
              </Link>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}