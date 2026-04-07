'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import CommandPalette from '@/components/CommandPalette';
import CopilotPanel from '@/components/CopilotPanel';
import { Sparkles } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <CommandPalette />
      <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Copilot trigger button */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#00D4AA] text-[#050E1A] text-sm font-medium shadow-lg hover:bg-[#00D4AA]/90 transition-colors"
        aria-label="Open AI Copilot"
      >
        <Sparkles size={16} />
        <span className="hidden sm:inline">Copilot</span>
      </button>
    </div>
  );
}
