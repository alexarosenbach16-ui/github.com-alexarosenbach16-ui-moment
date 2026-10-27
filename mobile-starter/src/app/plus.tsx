import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

const REASONS = ['Too busy', 'Partner stopped', 'Too expensive', 'Questions got repetitive', 'Other'];
const FREE = [
  'One Moment a day, with the reveal and hearts',
  'Mood check-in',
  'Shared streak, with a grace day and a repair',
  'History for the last 30 days',
];
const ADDS = [
  'Shared to-dos',
  'Bonus question packs',
  'Date ideas',
  'Your year together',
  'Full History',
  'Extra Moments per day',
];

export default function PlusScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saved = app.state?.cancelReason ?? '';
  const choice = app.state?.planChoice ?? '';
  const plus = app.state?.isPlus ?? false;
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
        <Text style={styles.barTitle}>Moment Plus</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 28 }}>
        <Text style={styles.title}>One plan for both of you</Text>
        <Text style={styles.copy}>One subscription covers both of you. This is a preview. Nothing is billed.</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: choice === 'year' }} onPress={() => app.setPlanChoice('year')} style={[styles.price, choice === 'year' && styles.priceOn]}>
          <Text style={styles.priceValue}>$49.99</Text>
          <Text style={styles.priceNote}>per year, for the couple</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: choice === 'month' }} onPress={() => app.setPlanChoice('month')} style={[styles.price, choice === 'month' && styles.priceOn]}>
          <Text style={styles.priceValue}>$8.99</Text>
          <Text style={styles.priceNote}>per month, for the couple</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !choice }} disabled={!choice} style={[styles.soon, !choice && styles.soonOff]}>
          <Text style={[styles.soonText, !choice && styles.soonTextOff]}>Coming soon</Text>
        </Pressable>
        <Text style={styles.heading}>Free forever</Text>
        {FREE.map((item) => <Text key={item} style={styles.item}>• {item}</Text>)}
        <Text style={styles.heading}>Plus adds</Text>
        {ADDS.map((item) => <Text key={item} style={styles.item}>• {item}</Text>)}
        {plus ? (
          <>
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
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { color: colors.primary, fontWeight: '700', fontSize: 16, paddingVertical: 8 },
  barTitle: { fontFamily: serif, fontSize: 20, color: colors.ink },
  title: { fontFamily: serif, fontSize: 34, lineHeight: 40, color: colors.ink },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 8 },
  price: { marginTop: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16 },
  priceOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  priceValue: { fontFamily: serif, fontSize: 28, color: colors.ink },
  priceNote: { color: colors.muted, marginTop: 2 },
  soon: { marginTop: 16, minHeight: 48, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  soonOff: { backgroundColor: colors.line },
  soonText: { color: '#fff', fontWeight: '700' },
  soonTextOff: { color: colors.muted },
  heading: { fontFamily: serif, fontSize: 26, color: colors.ink, marginTop: 24 },
  item: { color: colors.ink, fontSize: 15, lineHeight: 22, marginTop: 6 },
  reason: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', justifyContent: 'center', paddingHorizontal: 14 },
  reasonOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  reasonText: { color: colors.ink, fontSize: 16 },
  saved: { marginTop: 14, color: colors.ink },
});
