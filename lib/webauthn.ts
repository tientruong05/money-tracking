import { db } from "./db";

const CREDENTIAL_ID_KEY = "webauthn_credential_id";

/**
 * WebAuthn here is used purely as a local unlock gate (proving the device owner passed
 * Face ID/Touch ID), not as the app's actual identity provider — Supabase Auth already
 * owns that. See PRD 4.4: this replaces re-typing the PIN, it doesn't replace login.
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function hasWebAuthnSet(): Promise<boolean> {
  const row = await db.settings.get(CREDENTIAL_ID_KEY);
  return !!row;
}

export async function registerWebAuthn(): Promise<void> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Money Tracker" },
      user: { id: userId, name: "money-tracker", displayName: "Money Tracker" },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Không thể đăng ký Face ID/Touch ID");

  await db.settings.put({ key: CREDENTIAL_ID_KEY, value: credential.id });
}

export async function verifyWebAuthn(): Promise<boolean> {
  const row = await db.settings.get(CREDENTIAL_ID_KEY);
  if (!row) return false;

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: base64UrlToBuffer(row.value), type: "public-key" }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}

export async function clearWebAuthn(): Promise<void> {
  await db.settings.delete(CREDENTIAL_ID_KEY);
}

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
