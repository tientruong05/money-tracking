import { WalletList } from "@/components/wallets/wallet-list";

export default function WalletsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Ví</h1>
      <WalletList />
    </div>
  );
}
