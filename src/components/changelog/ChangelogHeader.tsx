
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ChangelogHeader = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Changelog & Release Notes</h1>
      <div className="flex gap-2">
        {user && user.user_metadata?.is_moderator && (
          <Button asChild>
            <Link to="/moderation?tab=changelog">Manage Changelog</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};
