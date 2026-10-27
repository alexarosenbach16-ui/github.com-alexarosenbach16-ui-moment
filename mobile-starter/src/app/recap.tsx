import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { catalog } from '@/data/catalog';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function RecapScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const state = app.state;
  const year = (state?.date ?? '2026').slice(0, 4);
  const moments = (state?.history ?? []).filter((item) => item.date.startsWith(year) && item.me.trim() && item.partner.trim());
  const counts = new Map<string, number>();
  for (const item of moments) {
    for (const tag of catalog[item.index]?.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const favorites = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const highlights = moments.slice(0, 3);
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
        <Text style={styles.barTitle}>Your year</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 24 }}>
        <Text style={styles.title}>Your year together</Text>
        <Text style={styles.copy}>A look back at {year}.</Text>
        <Text style={styles.count}>{moments.length}</Text>
        <Text style={styles.label}>Moments shared</Text>
        <Text style={styles.heading}>Favorite tags</Text>
        {favorites.length ? favorites.map(([tag, count]) => (
          <Text key={tag} style={styles.tag}>{tag} · {count}</Text>
        )) : <Text style={styles.copy}>Tags show up as you answer.</Text>}
        <Text style={styles.heading}>A few answers</Text>
        {highlights.map((item) => (
          <View key={item.date} style={styles.card}>
            <Text style={styles.prompt}>{catalog[item.index]?.prompt}</Text>
            <Text style={styles.who}>{state?.me}</Text>
            <Text style={styles.words}>{item.me}</Text>
            <Text style={styles.who}>{state?.partner}</Text>
            <Text style={styles.words}>{item.partner}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  barTitle: { fontFamily: serif, fontSize: 20, color: colors.ink },
  title: { fontFamily: serif, fontSize: 34, lineHeight: 40, color: colors.ink },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 8 },
  count: { fontFamily: serif, fontSize: 56, color: colors.ink, marginTop: 16 },
  label: { color: colors.muted },
  heading: { fontFamily: serif, fontSize: 26, color: colors.ink, marginTop: 22 },
  tag: { color: colors.ink, fontSize: 16, marginTop: 6 },
  card: { marginTop: 10, backgroundColor: colors.lavender, borderRadius: 16, padding: 14 },
  prompt: { fontFamily: serif, fontSize: 18, color: colors.ink },
  who: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 10 },
  words: { color: colors.ink, marginTop: 2 },
});
