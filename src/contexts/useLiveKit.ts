
/**
 * useLiveKit() React hook for consuming LiveKitContext.
 * Ensures proper context usage by throwing outside <LiveKitProvider>.
 * 
 * @returns LiveKitContextType object (room state, join/leave/toggle functions)
 */
import { useContext } from "react";
import LiveKitContext from "./LiveKitContext";

export function useLiveKit() {
  const context = useContext(LiveKitContext);
  if (context === undefined) {
    throw new Error("useLiveKit must be used within a LiveKitProvider");
  }
  return context;
}
