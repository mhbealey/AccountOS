"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a <Dialog> provider");
  }
  return context;
}

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null) as React.MutableRefObject<HTMLButtonElement | null>;

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const { setOpen, triggerRef } = useDialogContext();

    const combinedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref, triggerRef]
    );

    return (
      <button
        ref={combinedRef}
        type="button"
        onClick={(e) => {
          setOpen(true);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDialogContext();
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
        }

        if (e.key === "Tab" && contentRef.current) {
          const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          const firstEl = focusableElements[0];
          const lastEl = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl?.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl?.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => {
        const focusable = contentRef.current?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 0);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        clearTimeout(timer);
        triggerRef.current?.focus();
      };
    }, [open, setOpen, triggerRef]);

    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    if (!mounted || !open) return null;

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          ref={combinedRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/40 animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </div>,
      document.body
    );
  }
);
DialogContent.displayName = "DialogContent";

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-left", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
