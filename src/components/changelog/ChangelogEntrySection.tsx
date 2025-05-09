
import React from "react";
import { Pin, Rocket, Wrench, Bug } from "lucide-react";
import { format } from "date-fns";
import { ChangelogEntry } from "@/components/moderation/changelog/types";

interface ChangelogEntrySectionProps {
  entry: ChangelogEntry;
  isCurrent?: boolean;
}

export const ChangelogEntrySection = ({ entry, isCurrent = false }: ChangelogEntrySectionProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Pin className={`${isCurrent ? "text-talkstream-purple" : "text-gray-500"} h-5 w-5`} />
        <h2 className="text-2xl font-semibold" id={`v${entry.version}`}>
          [{entry.version}] - {formatDate(entry.release_date)}
          {isCurrent && (
            <span className="text-sm bg-talkstream-purple/10 text-talkstream-purple px-2 py-1 rounded-md ml-2">
              Current Update
            </span>
          )}
          {entry.version === "1.0.0" && !isCurrent && (
            <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-md ml-2">
              Initial Release 🎉
            </span>
          )}
        </h2>
      </div>
      
      {entry.features.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="text-talkstream-purple h-4 w-4" />
            <h3 className="text-xl font-medium">
              {entry.version === "1.0.0" && !isCurrent ? "Core Features" : "New Features"}
            </h3>
          </div>
          <div className="pl-6 border-l border-border ml-2">
            {entry.features.map((section, i) => (
              <div key={i} className="mb-3">
                {section.title && (
                  <h4 className="font-medium mb-1">{section.title}</h4>
                )}
                <ul className="list-disc pl-6 mb-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {entry.improvements.length > 0 && entry.improvements[0].items.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="text-blue-500 h-4 w-4" />
            <h3 className="text-xl font-medium">
              {isCurrent ? "Improvements & Refactoring" : "Improvements"}
            </h3>
          </div>
          <div className="pl-6 border-l border-border ml-2">
            {entry.improvements.map((section, i) => (
              <div key={i}>
                {section.title && (
                  <h4 className="font-medium mb-1">{section.title}</h4>
                )}
                <ul className="list-disc pl-6">
                  {section.items.map((item, j) => (
                    <li key={j} className="mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {entry.bug_fixes.length > 0 && entry.bug_fixes[0].items.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="text-red-500 h-4 w-4" />
            <h3 className="text-xl font-medium">Bug Fixes</h3>
          </div>
          <div className="pl-6 border-l border-border ml-2">
            {entry.bug_fixes.map((section, i) => (
              <div key={i}>
                {section.title && (
                  <h4 className="font-medium mb-1">{section.title}</h4>
                )}
                <ul className="list-disc pl-6">
                  {section.items.map((item, j) => (
                    <li key={j} className="mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
