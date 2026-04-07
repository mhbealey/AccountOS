'use client';

import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  actions?: ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-[#0B1B2E]/80 backdrop-blur-sm border-b border-[#1A3550]">
      <h1 className="text-lg font-semibold text-[#F0F4F8] truncate">{title}</h1>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
