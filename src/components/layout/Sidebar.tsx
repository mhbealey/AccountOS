'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  MessageSquare,
  CheckSquare,
  Clock,
  FileText,
  Shield,
  Lightbulb,
  BookOpen,
  BarChart3,
  Mail,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Clients', href: '/clients', icon: Users },
      { label: 'Pipeline', href: '/pipeline', icon: GitBranch },
      { label: 'Activity', href: '/activity', icon: MessageSquare },
    ],
  },
  {
    title: 'MANAGE',
    items: [
      { label: 'Tasks', href: '/tasks', icon: CheckSquare },
      { label: 'Time', href: '/time', icon: Clock },
      { label: 'Invoices', href: '/invoices', icon: FileText },
      { label: 'Contracts', href: '/contracts', icon: Shield },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
    ],
  },
  {
    title: 'GROW',
    items: [
      { label: 'Proposals', href: '/proposals', icon: Lightbulb },
      { label: 'Playbooks', href: '/playbooks', icon: BookOpen },
      { label: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'OTHER',
    items: [
      { label: 'Templates', href: '/templates', icon: Mail },
      { label: 'Network', href: '/network', icon: Globe },
      { label: 'Knowledge Base', href: '/snippets', icon: BookOpen },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-[#0B1B2E] border-r border-[#1A3550] h-screen sticky top-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-[#1A3550]">
        {!collapsed && (
          <span className="text-lg font-semibold text-[#00D4AA]">AccountOS</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-[#1A3550] text-[#829AB1] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-2 mb-2 text-xs font-medium tracking-wider text-[#829AB1]/60 uppercase">
                {section.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
                        active
                          ? 'text-[#00D4AA] bg-[#00D4AA]/10'
                          : 'text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550]/50'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User area */}
      <div className="border-t border-[#1A3550] p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00D4AA]/20 text-[#00D4AA] flex items-center justify-center text-sm font-medium shrink-0">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#F0F4F8] truncate">Account User</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
