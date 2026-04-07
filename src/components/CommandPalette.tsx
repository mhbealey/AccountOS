'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Users,
  GitBranch,
  CheckSquare,
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
} from 'lucide-react';

interface CommandItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const commands: CommandItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview of your account metrics' },
  { label: 'Clients', href: '/clients', icon: Users, description: 'Manage client accounts and contacts' },
  { label: 'Pipeline', href: '/pipeline', icon: GitBranch, description: 'Track deals and opportunities' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, description: 'View and manage your tasks' },
  { label: 'Activity', href: '/activity', icon: MessageSquare, description: 'Recent activity and communications' },
  { label: 'Time', href: '/time', icon: Clock, description: 'Track time entries and billable hours' },
  { label: 'Invoices', href: '/invoices', icon: FileText, description: 'Create and manage invoices' },
  { label: 'Contracts', href: '/contracts', icon: Shield, description: 'Contract management and renewals' },
  { label: 'Proposals', href: '/proposals', icon: Lightbulb, description: 'Create and send proposals' },
  { label: 'Playbooks', href: '/playbooks', icon: BookOpen, description: 'Standardized processes and workflows' },
  { label: 'Reports', href: '/reports', icon: BarChart3, description: 'Analytics and reporting dashboards' },
  { label: 'Templates', href: '/templates', icon: Mail, description: 'Email and document templates' },
  { label: 'Network', href: '/network', icon: Globe, description: 'Professional network and connections' },
  { label: 'Settings', href: '/settings', icon: Settings, description: 'Application preferences and config' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = commands.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery('');
            setSelectedIndex(0);
          }
          return !prev;
        });
      }
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      handleNavigate(filtered[selectedIndex]!.href);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#050E1A]/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 rounded-xl border border-[#1A3550] bg-[#0B1B2E] shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A3550]">
          <Search size={18} className="text-[#829AB1] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-[#F0F4F8] placeholder-[#829AB1]/60 text-sm outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[#829AB1] bg-[#1A3550] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#829AB1] text-center">
              No results found.
            </p>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                      : 'text-[#F0F4F8] hover:bg-[#1A3550]/50'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className={`text-xs truncate ${
                      index === selectedIndex ? 'text-[#00D4AA]/70' : 'text-[#829AB1]'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[#1A3550] text-[10px] text-[#829AB1]">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
