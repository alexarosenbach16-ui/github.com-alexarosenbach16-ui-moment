import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

const REASONS = ['Too busy', 'Partner stopped', 'Too expensive', 'Questions got repetitive', 'Other'];

export default function PlusScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saved = app.state?.cancelReason ?? '';
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
      <Text style={styles.title}>Moment Plus</Text>
      <Text style={styles.copy}>Coming later. Nothing to buy here, and nothing is locked.</Text>
      <Text style={styles.heading}>Cancel plan</Text>
      <Text style={styles.copy}>A practice screen. Your reason stays on this phone.</Text>
      <View style={{ gap: 8, marginTop: 8 }}>
        {REASONS.map((reason) => (
          <Pressable key={reason} accessibilityRole="button" accessibilityState={{ selected: saved === reason }} onPress={() => app.setCancelReason(reason)} style={[styles.reason, saved === reason && styles.reasonOn]}>
            <Text style={styles.reasonText}>{reason}</Text>
          </Pressable>
        ))}
      </View>
      {saved ? <Text style={styles.saved}>Saved: {saved}. Nothing was charged.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22 },
  back: { color: colors.primary, fontWeight: '700', fontSize: 16, paddingVertical: 12 },
  title: { fontFamily: serif, fontSize: 34, color: colors.ink, marginTop: 8 },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 8 },
  heading: { fontFamily: serif, fontSize: 26, color: colors.ink, marginTop: 24 },
  reason: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', justifyContent: 'center', paddingHorizontal: 14 },
  reasonOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  reasonText: { color: colors.ink, fontSize: 16 },
  saved: { marginTop: 14, color: colors.ink },
});
