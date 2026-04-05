"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowRight,
  Plus,
  Sparkles,
  X,
  Users,
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Clock,
  FileText,
  ScrollText,
  Activity,
  FileEdit,
  BookOpen,
  LayoutTemplate,
  BarChart3,
  Settings,
  Mail,
  CalendarCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  category: "navigate" | "create" | "search" | "ai";
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  shortcut?: string;
  action: () => void;
}

interface SearchResult {
  id: string;
  type: "client" | "contact" | "deal" | "task";
  name: string;
  subtitle?: string;
  href: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<
  CommandItem["category"],
  { label: string; icon: React.ReactNode }
> = {
  navigate: { label: "Navigate", icon: <ArrowRight className="h-3.5 w-3.5" /> },
  create: { label: "Create", icon: <Plus className="h-3.5 w-3.5" /> },
  search: { label: "Search Results", icon: <Search className="h-3.5 w-3.5" /> },
  ai: { label: "AI Commands", icon: <Sparkles className="h-3.5 w-3.5" /> },
};

// Mock search data -- replace with live API calls
const MOCK_CLIENTS = [
  { id: "c1", name: "Acme Corp", status: "Active" },
  { id: "c2", name: "Globex Inc", status: "Active" },
  { id: "c3", name: "Initech", status: "Prospect" },
  { id: "c4", name: "Umbrella Corp", status: "At-Risk" },
  { id: "c5", name: "Stark Industries", status: "Onboarding" },
];

const MOCK_CONTACTS = [
  { id: "co1", name: "Sarah Chen", clientName: "Acme Corp", clientId: "c1" },
  { id: "co2", name: "Mike Johnson", clientName: "Globex Inc", clientId: "c2" },
  { id: "co3", name: "Lisa Park", clientName: "Initech", clientId: "c3" },
];

const MOCK_DEALS = [
  { id: "d1", title: "Website Redesign", clientName: "Acme Corp", clientId: "c1" },
  { id: "d2", title: "Q2 Consulting", clientName: "Globex Inc", clientId: "c2" },
  { id: "d3", title: "Security Audit", clientName: "Initech", clientId: "c3" },
];

const MOCK_TASKS = [
  { id: "t1", title: "Review proposal draft", clientName: "Acme Corp" },
  { id: "t2", title: "Send follow-up email", clientName: "Globex Inc" },
  { id: "t3", title: "Prepare QBR slides", clientName: "Umbrella Corp" },
];

function searchEntities(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const c of MOCK_CLIENTS) {
    if (c.name.toLowerCase().includes(q)) {
      results.push({
        id: c.id,
        type: "client",
        name: c.name,
        subtitle: c.status,
        href: `/clients/${c.id}`,
      });
    }
  }
  for (const co of MOCK_CONTACTS) {
    if (co.name.toLowerCase().includes(q)) {
      results.push({
        id: co.id,
        type: "contact",
        name: co.name,
        subtitle: co.clientName,
        href: `/clients/${co.clientId}`,
      });
    }
  }
  for (const d of MOCK_DEALS) {
    if (d.title.toLowerCase().includes(q)) {
      results.push({
        id: d.id,
        type: "deal",
        name: d.title,
        subtitle: d.clientName,
        href: `/pipeline/${d.id}`,
      });
    }
  }
  for (const t of MOCK_TASKS) {
    if (t.title.toLowerCase().includes(q)) {
      results.push({
        id: t.id,
        type: "task",
        name: t.title,
        subtitle: t.clientName,
        href: `/tasks/${t.id}`,
      });
    }
  }

  return results.slice(0, 8);
}

const TYPE_BADGE_COLORS: Record<SearchResult["type"], string> = {
  client: "bg-[rgba(99,102,241,0.15)] text-[#818cf8]",
  contact: "bg-[rgba(34,197,94,0.15)] text-[#22c55e]",
  deal: "bg-[rgba(234,179,8,0.15)] text-[#eab308]",
  task: "bg-[rgba(59,130,246,0.15)] text-[#3b82f6]",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CommandPaletteProps {
  onOpenAICopilot?: () => void;
}

function CommandPalette({ onOpenAICopilot }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // ── Keyboard shortcut to open ──
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── Auto-focus input when opened ──
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ── Build items ──
  const close = React.useCallback(() => setOpen(false), []);

  const navigationItems: CommandItem[] = React.useMemo(
    () => [
      { id: "nav-dashboard", category: "navigate", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard", shortcut: "G D", action: () => { router.push("/"); close(); } },
      { id: "nav-clients", category: "navigate", icon: <Users className="h-4 w-4" />, label: "Clients", shortcut: "G C", action: () => { router.push("/clients"); close(); } },
      { id: "nav-pipeline", category: "navigate", icon: <Kanban className="h-4 w-4" />, label: "Pipeline", shortcut: "G P", action: () => { router.push("/pipeline"); close(); } },
      { id: "nav-tasks", category: "navigate", icon: <CheckSquare className="h-4 w-4" />, label: "Tasks", shortcut: "G T", action: () => { router.push("/tasks"); close(); } },
      { id: "nav-time", category: "navigate", icon: <Clock className="h-4 w-4" />, label: "Time", action: () => { router.push("/time"); close(); } },
      { id: "nav-invoices", category: "navigate", icon: <FileText className="h-4 w-4" />, label: "Invoices", action: () => { router.push("/invoices"); close(); } },
      { id: "nav-contracts", category: "navigate", icon: <ScrollText className="h-4 w-4" />, label: "Contracts", action: () => { router.push("/contracts"); close(); } },
      { id: "nav-activity", category: "navigate", icon: <Activity className="h-4 w-4" />, label: "Activity", action: () => { router.push("/activity"); close(); } },
      { id: "nav-proposals", category: "navigate", icon: <FileEdit className="h-4 w-4" />, label: "Proposals", action: () => { router.push("/proposals"); close(); } },
      { id: "nav-playbooks", category: "navigate", icon: <BookOpen className="h-4 w-4" />, label: "Playbooks", action: () => { router.push("/playbooks"); close(); } },
      { id: "nav-templates", category: "navigate", icon: <LayoutTemplate className="h-4 w-4" />, label: "Templates", action: () => { router.push("/templates"); close(); } },
      { id: "nav-reports", category: "navigate", icon: <BarChart3 className="h-4 w-4" />, label: "Reports", action: () => { router.push("/reports"); close(); } },
      { id: "nav-settings", category: "navigate", icon: <Settings className="h-4 w-4" />, label: "Settings", action: () => { router.push("/settings"); close(); } },
    ],
    [router, close]
  );

  const createItems: CommandItem[] = React.useMemo(
    () => [
      { id: "new-client", category: "create", icon: <Users className="h-4 w-4" />, label: "New Client", action: () => { router.push("/clients?action=create"); close(); } },
      { id: "new-deal", category: "create", icon: <Kanban className="h-4 w-4" />, label: "New Deal", action: () => { router.push("/pipeline?action=create"); close(); } },
      { id: "new-task", category: "create", icon: <CheckSquare className="h-4 w-4" />, label: "New Task", action: () => { router.push("/tasks?action=create"); close(); } },
      { id: "new-time", category: "create", icon: <Clock className="h-4 w-4" />, label: "New Time Entry", action: () => { router.push("/time?action=create"); close(); } },
      { id: "new-invoice", category: "create", icon: <FileText className="h-4 w-4" />, label: "New Invoice", action: () => { router.push("/invoices?action=create"); close(); } },
      { id: "new-activity", category: "create", icon: <Activity className="h-4 w-4" />, label: "New Activity", action: () => { router.push("/activity?action=create"); close(); } },
      { id: "new-proposal", category: "create", icon: <FileEdit className="h-4 w-4" />, label: "New Proposal", action: () => { router.push("/proposals?action=create"); close(); } },
      { id: "new-contract", category: "create", icon: <ScrollText className="h-4 w-4" />, label: "New Contract", action: () => { router.push("/contracts?action=create"); close(); } },
      { id: "new-template", category: "create", icon: <LayoutTemplate className="h-4 w-4" />, label: "New Template", action: () => { router.push("/templates?action=create"); close(); } },
    ],
    [router, close]
  );

  const aiItems: CommandItem[] = React.useMemo(
    () => [
      {
        id: "ai-meeting-prep",
        category: "ai",
        icon: <CalendarCheck className="h-4 w-4" />,
        label: "Prep for meeting with...",
        subtitle: "Generate client meeting brief",
        action: () => { close(); onOpenAICopilot?.(); },
      },
      {
        id: "ai-draft-email",
        category: "ai",
        icon: <Mail className="h-4 w-4" />,
        label: "Draft email to...",
        subtitle: "AI-powered email drafting",
        action: () => { close(); onOpenAICopilot?.(); },
      },
      {
        id: "ai-weekly-digest",
        category: "ai",
        icon: <Sparkles className="h-4 w-4" />,
        label: "Generate weekly digest",
        subtitle: "Portfolio summary & priorities",
        action: () => { close(); onOpenAICopilot?.(); },
      },
    ],
    [close, onOpenAICopilot]
  );

  // ── Filtering ──
  const q = query.toLowerCase().trim();

  const searchResults = React.useMemo(() => searchEntities(query), [query]);

  const searchItems: CommandItem[] = React.useMemo(
    () =>
      searchResults.map((r) => ({
        id: `search-${r.id}`,
        category: "search" as const,
        icon: <Search className="h-4 w-4" />,
        label: r.name,
        subtitle: r.subtitle,
        action: () => {
          router.push(r.href);
          close();
        },
      })),
    [searchResults, router, close]
  );

  const filteredItems = React.useMemo(() => {
    const all = [...navigationItems, ...createItems, ...aiItems];
    const filtered = q
      ? all.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q))
        )
      : all;
    return [...searchItems, ...filtered];
  }, [q, navigationItems, createItems, aiItems, searchItems]);

  // ── Group by category ──
  const grouped = React.useMemo(() => {
    const map = new Map<CommandItem["category"], CommandItem[]>();
    for (const item of filteredItems) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filteredItems]);

  // Flat ordered list for keyboard nav
  const flatItems = React.useMemo(() => {
    const order: CommandItem["category"][] = ["search", "navigate", "create", "ai"];
    const result: CommandItem[] = [];
    for (const cat of order) {
      const items = grouped.get(cat);
      if (items) result.push(...items);
    }
    return result;
  }, [grouped]);

  // ── Clamp selected index ──
  React.useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(0, flatItems.length - 1)));
  }, [flatItems.length]);

  // ── Scroll selected into view ──
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // ── Keyboard navigation ──
  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % flatItems.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
        break;
      case "Enter":
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          flatItems[selectedIndex].action();
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  if (!open) return null;

  // ── Render ──
  let itemCounter = 0;
  const categoryOrder: CommandItem["category"][] = ["search", "navigate", "create", "ai"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in-95 duration-150 rounded-xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            aria-label="Search commands"
          />
          <button
            onClick={close}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[360px] overflow-y-auto overscroll-contain p-2"
          role="listbox"
        >
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {categoryOrder.map((cat) => {
            const items = grouped.get(cat);
            if (!items || items.length === 0) return null;
            const meta = CATEGORY_META[cat];

            return (
              <div key={cat} className="mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {meta.icon}
                  {meta.label}
                </div>
                {items.map((item) => {
                  const index = itemCounter++;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-primary/15 text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isSelected
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {cat === "search" && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                TYPE_BADGE_COLORS[
                                  (searchResults.find(
                                    (r) => `search-${r.id}` === item.id
                                  )?.type ?? "client") as SearchResult["type"]
                                ]
                              )}
                            >
                              {searchResults.find(
                                (r) => `search-${r.id}` === item.id
                              )?.type ?? ""}
                            </span>
                          )}
                          <span className="truncate font-medium">
                            {item.label}
                          </span>
                        </div>
                        {item.subtitle && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                          {item.shortcut.split(" ").map((key) => (
                            <span
                              key={key}
                              className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono"
                            >
                              {key}
                            </span>
                          ))}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">
                ↵
              </kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">
                esc
              </kbd>
              close
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            AI ready
          </span>
        </div>
      </div>
    </div>
  );
}

export { CommandPalette };
