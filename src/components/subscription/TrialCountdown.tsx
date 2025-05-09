
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

export const TrialCountdown = () => {
  const { isTrialing, trialEnd } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  useEffect(() => {
    if (!isTrialing || !trialEnd) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date(trialEnd);
      
      if (endDate <= now) {
        setTimeLeft("Expired");
        return;
      }
      
      const days = differenceInDays(endDate, now);
      const hours = differenceInHours(endDate, now) % 24;
      const minutes = differenceInMinutes(endDate, now) % 60;
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${minutes} minutes remaining`);
      }
    };
    
    // Calculate immediately
    calculateTimeLeft();
    
    // Update every minute
    const interval = setInterval(calculateTimeLeft, 60000);
    
    return () => clearInterval(interval);
  }, [isTrialing, trialEnd]);
  
  if (!isTrialing || !trialEnd || !timeLeft) {
    return null;
  }
  
  return (
    <div className="text-xs font-medium bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full">
      Trial: {timeLeft}
    </div>
  );
};
