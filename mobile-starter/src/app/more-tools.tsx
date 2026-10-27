import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOpenFeature } from '@/components/FeatureCard';
import { Icon } from '@/components/Icon';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function MoreToolsScreen() {
  const app = useApp();
  const open = useOpenFeature();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const partner = app.state?.partner ?? 'Ben';
  const rows = [
    ['Our Sunday reflection', () => open('reflection')],
    ['Our four foundations', () => open('foundations')],
    ['Pause & reconnect', () => open('pause')],
    ['When words are hard', () => open('support')],
    ['Make time for us', () => open('plan')],
    ['Hangout debrief', () => open('debrief')],
    ['Wellbeing & sharing', () => open('wellbeing')],
    ['Wearable preview', () => open('wearable')],
    [`${partner}’s day`, () => app.setModal({ name: 'partner-update' })],
    ['Our focus', () => app.setModal({ name: 'focus', first: false })],
    ['Demo controls', () => app.setModal({ name: 'tools' })],
    ['Moment Plus', () => router.push('/plus')],
    ['Reset demo', () => app.setModal({ name: 'reset' })],
  ] as const;
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
        <Text style={styles.title}>More tools</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {rows.map(([title, onPress]) => (
          <Pressable key={title} accessibilityRole="button" onPress={onPress} style={styles.row}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Icon name="chevron" size={16} color="#a1a7b7" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { color: colors.primary, fontWeight: '700', fontSize: 16, paddingVertical: 8 },
  title: { fontFamily: serif, fontSize: 20, color: colors.ink },
  row: { minHeight: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: '#fff' },
  rowTitle: { flex: 1, color: colors.ink, fontSize: 16 },
});
