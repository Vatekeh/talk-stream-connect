
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/layout/app-header";

const THEMES = [
  { id: "dark", name: "Dark" },
  { id: "light", name: "Light" },
  { id: "system", name: "Use Device Settings" }
];

export default function AppearanceSettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState("dark");

  return (
    <div className="flex flex-col min-h-screen bg-clutsh-midnight">
      <AppHeader />
      
      <div className="flex-1 container max-w-md mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link to="/settings" className="mr-3">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-clutsh-light">Appearance</h1>
        </div>
        
        <div className="space-y-1">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className="w-full flex items-center justify-between py-3.5 px-2 border-b border-clutsh-slate/30 hover:bg-clutsh-slate/10 transition-colors"
              onClick={() => setSelectedTheme(theme.id)}
            >
              <span className="text-clutsh-light">{theme.name}</span>
              {selectedTheme === theme.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
