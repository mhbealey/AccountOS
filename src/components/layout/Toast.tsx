"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}

let globalAddToast: ((toast: Omit<ToastData, "id">) => void) | null = null;

function toast(options: Omit<ToastData, "id">) {
  if (globalAddToast) {
    globalAddToast(options);
  }
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback((newToast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...newToast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  React.useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>,
    document.body
  );
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-4.5 w-4.5 text-[#22c55e]" />,
  error: <AlertCircle className="h-4.5 w-4.5 text-[#ef4444]" />,
  warning: <AlertTriangle className="h-4.5 w-4.5 text-[#eab308]" />,
  info: <Info className="h-4.5 w-4.5 text-[#3b82f6]" />,
};

const borderColorMap: Record<ToastType, string> = {
  success: "border-l-[#22c55e]",
  error: "border-l-[#ef4444]",
  warning: "border-l-[#eab308]",
  info: "border-l-[#3b82f6]",
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border border-border border-l-4 bg-card p-4 shadow-xl shadow-black/20",
        borderColorMap[t.type]
      )}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{iconMap[t.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export { ToastProvider, useToast, toast };
