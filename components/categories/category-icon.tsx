import { getIcon } from "@/lib/icon-map";

export function CategoryIcon({ icon, color, size = 40 }: { icon: string; color?: string; size?: number }) {
  const Icon = getIcon(icon);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{ width: size, height: size, backgroundColor: color ?? "#6B7280" }}
    >
      {/* eslint-disable-next-line react-hooks/static-components -- getIcon returns a stable reference from a fixed lookup map, not a freshly-defined component */}
      <Icon style={{ color: "white", width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}
