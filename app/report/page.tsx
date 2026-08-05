import { ReportContent } from "@/components/report/report-content";

export default function ReportPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Báo cáo</h1>
      <ReportContent />
    </div>
  );
}
