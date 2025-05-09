
import React from "react";
import { Loader2 } from "lucide-react";

export const ChangelogLoading = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-talkstream-purple" />
    </div>
  );
};
