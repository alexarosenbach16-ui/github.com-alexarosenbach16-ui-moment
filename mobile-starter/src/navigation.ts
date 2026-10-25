import type { Href } from 'expo-router';

import type { TabId } from '@/data/types';

export function tabHref(tab: TabId): Href {
  if (tab === 'today') return '/';
  return `/${tab}` as Href;
}

export function tabFromPath(path: string): TabId | null {
  const clean = path.split('?')[0];
  if (clean === '/' || clean.endsWith('/index')) return 'today';
  if (clean.endsWith('/todo')) return 'todo';
  if (clean.endsWith('/features')) return 'features';
  if (clean.endsWith('/memories')) return 'memories';
  if (clean.endsWith('/us')) return 'us';
  return null;
}
