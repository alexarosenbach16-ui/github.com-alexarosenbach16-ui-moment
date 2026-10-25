import AsyncStorage from '@react-native-async-storage/async-storage';

import { initialState, normalizeState, validState } from '@/data/logic';
import type { AppState } from '@/data/types';

/**
 * On-device store for Moment.
 * Everything the couple types stays in AsyncStorage on this phone.
 * A future sync service can read and write the same AppState shape
 * without changing the screens. Nothing here talks to a server.
 */
export const STORAGE_KEY = 'moment_app_v1';

let queue: Promise<unknown> = Promise.resolve();

export async function loadState(): Promise<{ state: AppState; ok: boolean }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: initialState(), ok: true };
    const parsed: unknown = JSON.parse(raw);
    if (!validState(parsed)) return { state: initialState(), ok: true };
    return { state: normalizeState(parsed), ok: true };
  } catch {
    return { state: initialState(), ok: false };
  }
}

export function saveState(state: AppState): Promise<boolean> {
  const snapshot = JSON.stringify(state);
  const write = queue.then(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, snapshot);
  });
  queue = write.then(
    () => undefined,
    () => undefined,
  );
  return write.then(
    () => true,
    () => false,
  );
}
