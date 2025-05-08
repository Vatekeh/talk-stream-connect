
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtensionAuthHeader } from "./ExtensionAuthHeader";

interface ExtensionAuthLayoutProps {
  children: React.ReactNode;
}

export function ExtensionAuthLayout({ children }: ExtensionAuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-clutsh-midnight">
      <ExtensionAuthHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
