
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BaseSettingsItemProps {
  children: React.ReactNode;
  className?: string;
}

interface SettingsLinkItemProps extends BaseSettingsItemProps {
  to: string;
  onClick?: never;
  external?: boolean;
}

interface SettingsButtonItemProps extends BaseSettingsItemProps {
  to?: never;
  onClick: () => void;
  external?: never;
}

type SettingsItemProps = SettingsLinkItemProps | SettingsButtonItemProps;

export function SettingsItem({ 
  children, 
  to, 
  onClick, 
  external,
  className 
}: SettingsItemProps) {
  const content = (
    <div className={cn(
      "flex items-center justify-between py-3.5 w-full text-left", 
      "border-b border-clutsh-slate/30",
      "hover:bg-clutsh-slate/10 transition-colors",
      className
    )}>
      {children}
      <ChevronRight className="h-5 w-5 text-clutsh-muted flex-shrink-0" />
    </div>
  );
  
  if (to) {
    return external ? (
      <a href={to} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    ) : (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}

export function SettingsToggleItem({
  children,
  className
}: BaseSettingsItemProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-3.5", 
      "border-b border-clutsh-slate/30",
      className
    )}>
      {children}
    </div>
  );
}

export function SettingsSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm uppercase font-medium text-clutsh-muted mb-1 px-1">
      {children}
    </h2>
  );
}
