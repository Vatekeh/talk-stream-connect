
import React from "react";
import { Button } from "@/components/ui/button";

interface ChangelogErrorProps {
  onRetry: () => void;
}

export const ChangelogError = ({ onRetry }: ChangelogErrorProps) => {
  return (
    <div className="text-center py-20">
      <p className="text-lg text-red-500">Failed to load changelog data</p>
      <Button className="mt-4" onClick={onRetry}>Try Again</Button>
    </div>
  );
};
