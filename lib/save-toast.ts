import { toast } from "sonner";

/** Per PRD 2.3: silent when online, small toast when offline (or push failed). */
export function notifySaved() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    toast("Đã lưu — sẽ đồng bộ khi có mạng");
  }
}
