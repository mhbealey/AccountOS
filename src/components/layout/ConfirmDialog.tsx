"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "danger" | "warning";
  typedConfirmation?: string;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  typedConfirmation,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = React.useState("");

  const canConfirm = typedConfirmation
    ? typedValue === typedConfirmation
    : true;

  const handleCancel = () => {
    setTypedValue("");
    onOpenChange(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setTypedValue("");
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {typedConfirmation && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Type <span className="font-mono font-semibold text-foreground">{typedConfirmation}</span> to confirm:
            </p>
            <Input
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={typedConfirmation}
              autoComplete="off"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={cn(
              variant === "warning" &&
                "bg-[#eab308] text-black hover:bg-[#ca8a04]"
            )}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmDialog };
