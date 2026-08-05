import { getIcon } from "@/lib/icon-map";
import { WALLET_TYPE_FALLBACK_ICON } from "@/lib/wallet-presets";
import type { Wallet } from "@/lib/types";

function isImagePath(icon: string) {
  return icon.startsWith("http") || icon.startsWith("/") || icon.startsWith("data:");
}

export function WalletIcon({ wallet, size = 40 }: { wallet: Pick<Wallet, "icon" | "type" | "color" | "name">; size?: number }) {
  if (wallet.icon && isImagePath(wallet.icon)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={wallet.icon}
        alt={wallet.name}
        width={size}
        height={size}
        className="shrink-0 rounded-2xl bg-muted object-contain p-1"
        style={{ width: size, height: size }}
      />
    );
  }

  const Icon = getIcon(wallet.icon || WALLET_TYPE_FALLBACK_ICON[wallet.type]);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{ width: size, height: size, backgroundColor: "#22C55E" }}
    >
      {/* eslint-disable-next-line react-hooks/static-components -- getIcon returns a stable reference from a fixed lookup map, not a freshly-defined component */}
      <Icon style={{ color: "white", width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}
