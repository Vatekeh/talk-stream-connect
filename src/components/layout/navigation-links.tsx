
import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface NavigationLinksProps {
  className?: string;
  onClickLink?: () => void;
}

export function NavigationLinks({ 
  className = "", 
  onClickLink 
}: NavigationLinksProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isModerator = user?.user_metadata?.is_moderator;

  const getLinkClassName = (path: string) => {
    const isActive = location.pathname === path;
    return `text-sm font-medium text-clutsh-light hover:text-primary transition-colors relative ${
      isActive ? 'text-primary' : ''
    } ${isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' : 'hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-primary/50 hover:after:rounded-full'}`;
  };

  return (
    <nav className={`flex items-center gap-8 ${className}`}>
      <Link 
        to="/" 
        className={getLinkClassName('/')}
        onClick={onClickLink}
      >
        Home
      </Link>
      {isModerator && (
        <Link 
          to="/moderation" 
          className={`${getLinkClassName('/moderation')} flex items-center gap-1.5`}
          onClick={onClickLink}
        >
          <ShieldAlert size={16} />
          Moderation
        </Link>
      )}
      <Link 
        to="/pricing" 
        className={`${getLinkClassName('/pricing')} flex items-center gap-1.5`}
        onClick={onClickLink}
      >
        <DollarSign size={16} />
        Pricing
      </Link>
    </nav>
  );
}
