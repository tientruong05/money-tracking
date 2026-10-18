import type { Metadata } from "next";
import { CalculatorContent } from "@/components/calculator/calculator-content";

export const metadata: Metadata = {
  title: "Tính tiền | Money Tracker",
  description: "Bảng tính chi tiêu nhanh — tính toán số tiền còn lại sau các khoản chi.",
};

export default function CalculatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Tính tiền</h1>
      <CalculatorContent />
    </div>
  );
}
