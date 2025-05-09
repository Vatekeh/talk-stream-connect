
import { Link } from "react-router-dom";
import { ShieldAlert, History } from "lucide-react";

interface NavigationLinksProps {
  isModerator?: boolean;
  className?: string;
  onClickLink?: () => void;
}

export function NavigationLinks({ 
  isModerator = false, 
  className = "", 
  onClickLink 
}: NavigationLinksProps) {
  return (
    <nav className={className}>
      <Link 
        to="/" 
        className="text-sm font-medium"
        onClick={onClickLink}
      >
        Home
      </Link>
      {isModerator && (
        <Link 
          to="/moderation" 
          className="text-sm font-medium flex items-center gap-1"
          onClick={onClickLink}
        >
          <ShieldAlert size={14} />
          Moderation
        </Link>
      )}
      <Link 
        to="/changelog" 
        className="text-sm font-medium flex items-center gap-1"
        onClick={onClickLink}
      >
        <History size={14} />
        Changelog
      </Link>
    </nav>
  );
}
