"use client";

import { useCallback, useRef, useState } from "react";
import { Drawer } from "vaul";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
}

export function BottomSheet({ open, onOpenChange, title, description, children, contentClassName }: BottomSheetProps) {
  const [height, setHeight] = useState<number | "auto">("auto");
  const observerRef = useRef<ResizeObserver | null>(null);

  /**
   * Animates the sheet's height to match its content, so switching steps/tabs grows or
   * shrinks the panel smoothly instead of snapping.
   *
   * Uses a callback ref rather than an effect keyed on `open`: Vaul mounts the drawer
   * content on its own schedule, so an effect can run while the node is still null and
   * silently never attach the observer — leaving height stuck at "auto" (no animation).
   * A callback ref fires exactly when the node appears.
   *
   * Measuring real height also avoids Framer's `layout` prop, which animates via transforms
   * on descendants and breaks pointer hit-testing for popups rendered inside the sheet.
   */
  const setMeasureNode = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) {
      // Content unmounted (sheet closed) — reset so the next open measures fresh
      // instead of animating from a stale height.
      setHeight("auto");
      return;
    }

    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl border border-border bg-background pb-[env(safe-area-inset-bottom)] outline-none",
            "mx-auto w-full sm:max-w-md",
            contentClassName
          )}
        >
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
          {/* min-h-0 is required: as a flex child this defaults to `min-height: auto`, which
              refuses to shrink below its content — so `overflow-y-auto` never engages and tall
              forms overflow past the sheet, hiding the buttons at the bottom. */}
          <div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pt-4 pb-6">
            <Drawer.Title className="text-lg font-semibold text-foreground">{title}</Drawer.Title>
            {description && <Drawer.Description className="mt-1 text-sm text-muted-foreground">{description}</Drawer.Description>}
            <motion.div
              animate={{ height }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              style={{ overflow: "hidden" }}
              // shrink-0 matters: as a flex child this would otherwise be squashed by the
              // scroller, and its `overflow: hidden` would clip the tail of a tall form
              // (hiding the submit button) instead of letting the scroller scroll.
              className="mt-4 shrink-0"
            >
              <div ref={setMeasureNode}>{children}</div>
            </motion.div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
