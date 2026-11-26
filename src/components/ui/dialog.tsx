"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog parts must be rendered inside <Dialog>.");
  }
  return context;
}

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

/**
 * Lightweight shadcn-style Dialog built on the browser's native <dialog>.
 * Native modal dialogs use the browser top layer and built-in focus handling,
 * avoiding custom portals, stacking contexts and JavaScript focus traps.
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

type DialogContentProps = HTMLAttributes<HTMLDialogElement> & {
  children: ReactNode;
  closeOnBackdrop?: boolean;
};

export function DialogContent({
  children,
  className = "",
  closeOnBackdrop = true,
  onClick,
  onCancel,
  ...props
}: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrame = useRef<number | null>(null);

  const finishClose = useCallback(() => {
    const element = dialogRef.current;
    if (!element?.open) return;
    element.dataset.state = "closed";
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (dialogRef.current?.open && !open) {
        dialogRef.current.close();
      }
      closeTimer.current = null;
    }, 140);
  }, [open]);

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    if (open) {
      if (!element.open) element.showModal();
      element.dataset.state = "closed";
      animationFrame.current = window.requestAnimationFrame(() => {
        if (dialogRef.current?.open) {
          dialogRef.current.dataset.state = "open";
        }
      });
    } else {
      finishClose();
    }

    return () => {
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [open, finishClose]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <dialog
      {...props}
      ref={dialogRef}
      className={`ks-dialog ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        onCancel?.(event);
        onOpenChange(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget
        ) {
          onOpenChange(false);
        }
      }}
      onClose={() => {
        if (open) onOpenChange(false);
      }}
    >
      {children}
    </dialog>
  );
}

export function DialogHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ks-dialog-header ${className}`} {...props} />;
}

export function DialogTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`ks-dialog-title ${className}`} {...props} />;
}

export function DialogDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`ks-dialog-description ${className}`} {...props} />;
}

export function DialogFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ks-dialog-footer ${className}`} {...props} />;
}

export function DialogClose({
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useDialogContext();
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onOpenChange(false);
      }}
    />
  );
}
