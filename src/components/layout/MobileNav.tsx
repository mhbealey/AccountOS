'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  CheckSquare,
  MoreHorizontal,
  X,
  MessageSquare,
  Clock,
  FileText,
  Shield,
  Lightbulb,
  BookOpen,
  BarChart3,
  Mail,
  Globe,
  Settings,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const primaryItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
];

const moreItems = [
  { label: 'Activity', href: '/activity', icon: MessageSquare },
  { label: 'Time', href: '/time', icon: Clock },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Contracts', href: '/contracts', icon: Shield },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Proposals', href: '/proposals', icon: Lightbulb },
  { label: 'Playbooks', href: '/playbooks', icon: BookOpen },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Templates', href: '/templates', icon: Mail },
  { label: 'Network', href: '/network', icon: Globe },
  { label: 'Knowledge Base', href: '/snippets', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isMoreActive = moreItems.some((item) => isActive(item.href));

  return (
    <>
      {/* Fixed bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0B1B2E] border-t border-[#1A3550]">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
                  active ? 'text-[#00D4AA]' : 'text-[#829AB1]'
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
              isMoreActive ? 'text-[#00D4AA]' : 'text-[#829AB1]'
            )}
          >
            <MoreHorizontal size={20} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0B1B2E] border-t border-[#1A3550] rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#1A3550]">
              <h2 className="text-sm font-semibold text-[#F0F4F8]">More</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded hover:bg-[#1A3550] text-[#829AB1]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg text-xs transition-colors',
                      active
                        ? 'text-[#00D4AA] bg-[#00D4AA]/10'
                        : 'text-[#829AB1] hover:bg-[#1A3550]/50'
                    )}
                  >
                    <Icon size={22} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
