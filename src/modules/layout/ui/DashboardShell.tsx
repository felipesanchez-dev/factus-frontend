"use client";

import { ReactNode, useState } from "react";
import { AuthGuard } from "./AuthGuard";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950'>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className='flex flex-1 flex-col overflow-hidden'>
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className='flex-1 overflow-y-auto p-4 sm:p-6'>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
