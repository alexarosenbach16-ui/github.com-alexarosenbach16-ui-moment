import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
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
  const plus = app.state?.isPlus ?? false;
  const rows = [
    { title: 'Our Sunday reflection', onPress: () => open('reflection') },
    { title: 'Our four foundations', onPress: () => open('foundations') },
    { title: 'Pause & reconnect', onPress: () => open('pause') },
    { title: 'When words are hard', onPress: () => open('support') },
    { title: 'Make time for us', lock: !plus, onPress: () => (plus ? open('plan') : app.setModal({ name: 'plus', feature: 'todos' })) },
    { title: 'Hangout debrief', onPress: () => open('debrief') },
    { title: 'Wellbeing & sharing', onPress: () => open('wellbeing') },
    { title: 'Wearable preview', onPress: () => open('wearable') },
    { title: `${partner}’s day`, onPress: () => app.setModal({ name: 'partner-update' }) },
    { title: 'Our focus', onPress: () => app.setModal({ name: 'focus', first: false }) },
    { title: 'Bonus question packs', lock: !plus, onPress: () => app.setModal(plus ? { name: 'bonus' } : { name: 'plus', feature: 'packs' }) },
    { title: 'Date ideas', lock: !plus, onPress: () => app.setModal(plus ? { name: 'dates' } : { name: 'plus', feature: 'dates' }) },
    { title: 'Demo controls', onPress: () => app.setModal({ name: 'tools' }) },
    { title: 'Moment Plus', onPress: () => router.push('/plus') },
    { title: 'Reset demo', onPress: () => app.setModal({ name: 'reset' }) },
  ];
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
        <Text style={styles.title}>More tools</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {rows.map((row) => (
          <Pressable key={row.title} accessibilityRole="button" onPress={row.onPress} style={styles.row}>
            {row.lock ? <Icon name="lock" size={16} color={colors.primary} /> : null}
            <Text style={styles.rowTitle}>{row.title}</Text>
            <Icon name="chevron" size={16} color="#a1a7b7" />
          </Pressable>
        ))}
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Preview Plus (demo)</Text>
          <Switch accessibilityLabel="Preview Plus (demo)" value={plus} onValueChange={app.togglePlus} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { color: colors.primary, fontWeight: '700', fontSize: 16, paddingVertical: 8 },
  title: { fontFamily: serif, fontSize: 20, color: colors.ink },
  row: { minHeight: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: '#fff' },
  rowTitle: { flex: 1, color: colors.ink, fontSize: 16 },
});
