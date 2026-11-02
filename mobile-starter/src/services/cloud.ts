import { dateKey } from '@/data/logic';
import { parseSnapshot, type RemoteSnapshot } from '@/data/remote';
import { getSupabase } from '@/services/supabase';

function message(error: { message?: string } | null): string | null {
  return error?.message ?? null;
}

export async function currentUserId(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return '';
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? '';
}

export async function signUp(email: string, password: string): Promise<{ error: string; needsConfirm: boolean }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase is not configured on this build.', needsConfirm: false };
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { adult: true } },
  });
  if (error) return { error: error.message, needsConfirm: false };
  if (!data.session) return { error: '', needsConfirm: true };
  return { error: '', needsConfirm: false };
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Supabase is not configured on this build.';
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return message(error);
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function updateProfileName(name: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) return 'Sign in first.';
  const { error } = await supabase.from('profiles').upsert({ id, display_name: name.trim().slice(0, 24) });
  return message(error);
}

export async function createCouple(): Promise<{ code: string; error: string }> {
  const supabase = getSupabase();
  if (!supabase) return { code: '', error: 'Supabase is not configured.' };
  const { data, error } = await supabase.rpc('create_couple');
  if (error) return { code: '', error: error.message };
  return { code: typeof data === 'string' ? data : '', error: '' };
}

export async function joinCouple(code: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Supabase is not configured.';
  const { error } = await supabase.rpc('join_couple', { p_code: code });
  return message(error);
}

export async function unpairCouple(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.rpc('unpair');
  return message(error);
}

export async function deleteAccount(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Supabase is not configured.';
  const { error } = await supabase.rpc('delete_my_account');
  if (error) return error.message;
  await supabase.auth.signOut();
  return null;
}

export async function pullSync(day = dateKey(new Date())): Promise<RemoteSnapshot | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;
  const { data, error } = await supabase.rpc('sync_state', { p_day: day });
  if (error) return null;
  return parseSnapshot(data);
}

export async function pushAnswer(day: string, body: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.rpc('submit_answer', { p_day: day, p_body: body });
  return message(error);
}

export async function pushMood(day: string, mood: string, shared: boolean): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.rpc('set_mood', { p_day: day, p_mood: mood, p_shared: shared });
  return message(error);
}

export async function pushTodo(input: { id?: string; title: string; note: string; shared: boolean; due: string; done: boolean }): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const id = input.id && /^[0-9a-f-]{36}$/i.test(input.id) ? input.id : null;
  const { error } = await supabase.rpc('save_todo', {
    p_id: id,
    p_title: input.title,
    p_note: input.note,
    p_shared: input.shared,
    p_due: input.due || null,
    p_done: input.done,
  });
  return message(error);
}

export async function pushToggleTodo(id: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { error } = await supabase.rpc('toggle_todo', { p_id: id });
  return message(error);
}

export function subscribeFlags(coupleId: string, onChange: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase || !coupleId) return () => undefined;
  const channel = supabase
    .channel(`flags-${coupleId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'answer_flags', filter: `couple_id=eq.${coupleId}` }, () => onChange())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
