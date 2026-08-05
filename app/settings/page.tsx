import { CategoryList } from "@/components/categories/category-list";
import { AccountSection } from "@/components/settings/account-section";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Cài đặt</h1>
      <AccountSection />
      <CategoryList />
    </div>
  );
}
