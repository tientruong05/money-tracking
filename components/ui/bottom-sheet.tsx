"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const measureNodeRef = useRef<HTMLDivElement | null>(null);

  const remeasure = useCallback(() => {
    if (!measureNodeRef.current) return;
    observerRef.current?.disconnect();
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(measureNodeRef.current);
    observerRef.current = observer;
  }, []);

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
    measureNodeRef.current = node;

    if (!node) {
      setHeight("auto");
      return;
    }

    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  // Re-measure when the virtual keyboard opens/closes on mobile.
  // Without this, the animated height can get stuck at a stale value
  // because ResizeObserver fires before the viewport fully resizes.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    vv.addEventListener("resize", remeasure);
    vv.addEventListener("scroll", remeasure);
    return () => {
      vv.removeEventListener("resize", remeasure);
      vv.removeEventListener("scroll", remeasure);
    };
  }, [remeasure]);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border border-border bg-background pb-[env(safe-area-inset-bottom)] outline-none",
            "mx-auto w-full sm:max-w-md",
            contentClassName
          )}
        >
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
          <div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pt-4 pb-6">
            <Drawer.Title className="text-lg font-semibold text-foreground">{title}</Drawer.Title>
            {description && <Drawer.Description className="mt-1 text-sm text-muted-foreground">{description}</Drawer.Description>}
            <motion.div
              animate={{ height }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              style={{ overflow: "hidden" }}
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
