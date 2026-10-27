import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/ui';
import { streakInfo } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function WelcomeBackScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const info = app.state ? streakInfo(app.state) : { count: 0, graceDate: null };
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.badge}><Icon name="heart" size={22} color={colors.primary} /></View>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.copy}>Your answers are right where you left them.</Text>
      <Text style={styles.streak}>{info.count} days together</Text>
      {info.graceDate ? <Text style={styles.grace}>A grace day is already keeping your place.</Text> : null}
      <View style={{ marginTop: 24 }}>
        <PrimaryButton label="See today" onPress={() => { app.dismissWelcome(); router.replace('/'); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, justifyContent: 'center' },
  badge: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontFamily: serif, fontSize: 40, color: colors.ink },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 22, marginTop: 8 },
  streak: { fontFamily: serif, fontSize: 28, color: colors.ink, marginTop: 18 },
  grace: { color: colors.ink, marginTop: 8 },
});
