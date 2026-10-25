import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ModalHost } from '@/components/ModalHost';
import { ToastBanner } from '@/components/ui';
import { AppProvider } from '@/state/AppContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
        <ModalHost />
        <ToastBanner />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
