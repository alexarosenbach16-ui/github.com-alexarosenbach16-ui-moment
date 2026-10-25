import type { Href } from 'expo-router';

import type { TabId } from '@/data/types';

export function tabHref(tab: TabId): Href {
  if (tab === 'today') return '/';
  return '/us';
}

export function tabFromPath(path: string): TabId | null {
  const clean = path.split('?')[0];
  if (clean === '/' || clean.endsWith('/index')) return 'today';
  if (clean.endsWith('/us')) return 'us';
  return null;
}
