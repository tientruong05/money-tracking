import { supabase } from "./supabase";

/** Supabase Auth is optional — the app runs fully local-first without it (PRD 1.2, 2.6). */
export const authEnabled = supabase !== null;

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase chưa được cấu hình");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error("Supabase chưa được cấu hình");
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
