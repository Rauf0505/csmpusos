"use client";

import { Navbar } from "@/components/student/Navbar";
import { Sidebar } from "@/components/student/Sidebar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
