export interface BankLogo {
  name: string;
  src: string;
}

/** Real bank/e-wallet logos (PRD 2.1) — asset files live in public/bank-logo/. */
export const BANK_LOGOS: BankLogo[] = [
  { name: "MoMo", src: "/bank-logo/MOMO.webp" },
  { name: "Techcombank", src: "/bank-logo/TECHCOMBANK.svg" },
  { name: "MB Bank", src: "/bank-logo/MBBANK.png" },
  { name: "CAKE", src: "/bank-logo/CAKE.png" },
];
