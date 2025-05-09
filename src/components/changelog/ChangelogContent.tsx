
import React from "react";
import { ChangelogEntrySection } from "./ChangelogEntrySection";
import { UserFeedbackSection } from "./UserFeedbackSection";
import { ChangelogLoading } from "./ChangelogLoading";
import { ChangelogError } from "./ChangelogError";
import { ChangelogEmpty } from "./ChangelogEmpty";
import { useChangelogData } from "./hooks/useChangelogData";

export const ChangelogContent = () => {
  const { entries, loading, error, fetchChangelogs, getCurrentEntry } = useChangelogData();
  
  const currentEntry = getCurrentEntry();
  
  if (loading) {
    return <ChangelogLoading />;
  }
  
  if (error) {
    return <ChangelogError onRetry={fetchChangelogs} />;
  }
  
  if (entries.length === 0) {
    return <ChangelogEmpty />;
  }

  return (
    <>
      {/* Current Update */}
      {currentEntry && <ChangelogEntrySection entry={currentEntry} isCurrent={true} />}
      
      {/* Previous Updates */}
      {entries
        .filter(entry => !entry.is_current)
        .map(entry => (
          <ChangelogEntrySection key={entry.id} entry={entry} />
        ))}
      
      {/* User Feedback Section */}
      <UserFeedbackSection />
    </>
  );
};
