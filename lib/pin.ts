import { db } from "./db";

const PIN_HASH_KEY = "pin_hash";
const PIN_SALT_KEY = "pin_salt";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hasPinSet(): Promise<boolean> {
  const row = await db.settings.get(PIN_HASH_KEY);
  return !!row;
}

/** PIN never leaves the device — only its salted SHA-256 hash is stored locally (PRD 4.4 fallback). */
export async function setPin(pin: string): Promise<void> {
  const salt = randomSalt();
  const hash = await sha256Hex(pin + salt);
  await db.settings.bulkPut([
    { key: PIN_SALT_KEY, value: salt },
    { key: PIN_HASH_KEY, value: hash },
  ]);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const saltRow = await db.settings.get(PIN_SALT_KEY);
  const hashRow = await db.settings.get(PIN_HASH_KEY);
  if (!saltRow || !hashRow) return false;
  const hash = await sha256Hex(pin + saltRow.value);
  return hash === hashRow.value;
}

export async function clearPin(): Promise<void> {
  await db.settings.bulkDelete([PIN_HASH_KEY, PIN_SALT_KEY]);
}
