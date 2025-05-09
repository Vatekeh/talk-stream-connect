
import React from "react";
import { Mail } from "lucide-react";

export const UserFeedbackSection = () => {
  return (
    <div className="mb-8 bg-muted p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5" />
        <h2 className="text-xl font-semibold">User Feedback & Requests</h2>
      </div>
      <p className="mb-2">Your feedback helps us grow! Send your suggestions or report issues to:</p>
      <a href="mailto:feedback@clutsh.app" className="text-talkstream-purple hover:underline">
        feedback@clutsh.app
      </a>
    </div>
  );
};
