import { Tabs, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { TABS } from '@/data/catalog';
import { tabFromPath } from '@/navigation';
import { useApp } from '@/state/AppContext';
import { colors } from '@/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { ready, setTabFromRoute } = useApp();

  useEffect(() => {
    if (!ready) return;
    const tab = tabFromPath(pathname);
    if (tab) setTabFromRoute(tab);
  }, [pathname, ready, setTabFromRoute]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#777da9',
        tabBarInactiveTintColor: '#9aa1b1',
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopColor: colors.line,
          height: 64 + Math.max(insets.bottom, 16),
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16),
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { paddingTop: 2 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.id}
          name={tab.id === 'today' ? 'index' : tab.id}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, size }) => <Icon name={tab.icon} color={typeof color === 'string' ? color : '#777da9'} size={size ?? 21} />,
          }}
        />
      ))}
    </Tabs>
  );
}
