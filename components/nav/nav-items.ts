import type { LucideIcon } from "lucide-react";
import { House, Wallet, PiggyBank, Calculator, BarChart3, Settings } from "lucide-react";
import type { Route } from "next";

export interface NavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: House },
  { href: "/wallets", label: "Ví", icon: Wallet },
  { href: "/budget", label: "Ngân sách", icon: PiggyBank },
  { href: "/calculator", label: "Tính tiền", icon: Calculator },
  { href: "/report", label: "Báo cáo", icon: BarChart3 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];
