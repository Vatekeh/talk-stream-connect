
import { Json } from "@/integrations/supabase/types";
import { ChangelogItem } from "./types";

// Helper function to parse JSON fields from Supabase
export const parseJsonField = (field: Json): ChangelogItem[] => {
  if (!field) return [{ items: [] }];
  
  try {
    if (typeof field === 'string') {
      return JSON.parse(field) as ChangelogItem[];
    }
    // Handle the case where field is already an array (from Supabase)
    if (Array.isArray(field)) {
      // Ensure each item in the array conforms to ChangelogItem structure
      return field.map((item: any) => {
        if (typeof item === 'object' && 'items' in item) {
          return item as ChangelogItem;
        }
        return { items: Array.isArray(item) ? item : [String(item)] };
      });
    }
    return [{ items: [] }];
  } catch (e) {
    console.error('Failed to parse JSON field:', e);
    return [{ items: [] }];
  }
};

// Helper function to format items for textarea
export const formatItemsForTextarea = (items: ChangelogItem[]) => {
  let result = "";
  
  items.forEach((section, i) => {
    if (section.title) {
      result += `## ${section.title}\n`;
    }
    
    section.items.forEach(item => {
      result += `- ${item}\n`;
    });
    
    if (i < items.length - 1) {
      result += "\n";
    }
  });
  
  return result;
};

// Parse textarea content into structured format
export const parseTextareaContent = (text: string): ChangelogItem[] => {
  const lines = text.trim().split('\n');
  const result: ChangelogItem[] = [];
  
  let currentSection: ChangelogItem = { items: [] };
  
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    
    // Check if this is a section title
    if (line.startsWith('## ')) {
      // If we already have items in the current section, save it
      if (currentSection.items.length > 0) {
        result.push({ ...currentSection });
      }
      
      // Start a new section
      const title = line.substring(3).trim();
      currentSection = { title, items: [] };
    } 
    // Check if this is a list item
    else if (line.startsWith('- ')) {
      currentSection.items.push(line.substring(2).trim());
    } 
    // Treat as regular text (probably a list item without the dash)
    else {
      currentSection.items.push(line);
    }
  });
  
  // Add the final section if it has items
  if (currentSection.items.length > 0) {
    result.push(currentSection);
  }
  
  // If there are no sections with titles but there are items, create a single section
  if (result.length === 0 && lines.length > 0) {
    const items = lines
      .filter(line => line.trim())
      .map(line => {
        if (line.startsWith('- ')) {
          return line.substring(2).trim();
        }
        return line.trim();
      });
    
    if (items.length > 0) {
      result.push({ items });
    }
  }
  
  return result.length > 0 ? result : [{ items: [] }];
};
