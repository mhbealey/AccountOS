"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, Clock, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MobileMenuButton } from "@/components/layout/Sidebar";

interface HeaderProps {
  title: string;
  sidebarCollapsed: boolean;
  onMobileMenuOpen: () => void;
  saveStatus?: "idle" | "saving" | "saved";
  timerRunning?: boolean;
  timerDisplay?: string;
}

function Header({
  title,
  sidebarCollapsed,
  onMobileMenuOpen,
  saveStatus = "idle",
  timerRunning = false,
  timerDisplay = "00:00:00",
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6",
        sidebarCollapsed ? "md:pl-[calc(4rem+1.5rem)]" : "md:pl-[calc(15rem+1.5rem)]"
      )}
    >
      <MobileMenuButton onClick={onMobileMenuOpen} />

      <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>

      {saveStatus !== "idle" && (
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveStatus === "saving" && (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
              Saving...
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="h-3 w-3 text-success" />
              Saved
            </>
          )}
        </span>
      )}

      <div className="flex-1" />

      {timerRunning && (
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-mono text-primary">
          <Clock className="h-3.5 w-3.5" />
          {timerDisplay}
        </div>
      )}

      <button
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Search (Cmd+K)"
      >
        <Search className="h-4.5 w-4.5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground transition-transform hover:scale-105"
          aria-label="Create new"
        >
          <Plus className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>New Client</DropdownMenuItem>
          <DropdownMenuItem>New Deal</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>New Task</DropdownMenuItem>
          <DropdownMenuItem>New Invoice</DropdownMenuItem>
          <DropdownMenuItem>New Contract</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>New Proposal</DropdownMenuItem>
          <DropdownMenuItem>New Time Entry</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
        U
      </div>
    </header>
  );
}

export { Header };
