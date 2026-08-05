"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md md:hidden">
      <div className="flex items-center justify-around rounded-full border border-white/60 bg-white/75 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-zinc-900/80 dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center rounded-full py-1.5 text-[10px] font-medium transition-all duration-200 active:scale-95",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span className="mt-0.5 leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
