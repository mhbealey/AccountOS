'use client';

import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function Header({ title, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-surface/50 backdrop-blur-sm',
        className
      )}
    >
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
