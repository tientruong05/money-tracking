import { BudgetPageContent } from "@/components/budget/budget-page-content";

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Ngân sách</h1>
      <BudgetPageContent />
    </div>
  );
}
