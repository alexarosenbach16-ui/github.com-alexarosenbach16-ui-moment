import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { catalog } from '@/data/catalog';
import { prettyDate, streak } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function HistoryScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const state = app.state;
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const shared = (state?.history ?? []).filter((item) => item.me.trim());
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const item of shared) for (const label of catalog[item.index]?.tags ?? []) set.add(label);
    return [...set];
  }, [shared]);
  const filtered = shared.filter((item) => {
    const prompt = catalog[item.index];
    const hay = `${prompt?.prompt ?? ''} ${item.me} ${item.partner}`.toLowerCase();
    if (query.trim() && !hay.includes(query.trim().toLowerCase())) return false;
    if (tag && !(prompt?.tags ?? []).includes(tag)) return false;
    return true;
  });
  const groups = new Map<string, typeof filtered>();
  for (const item of [...filtered].sort((a, b) => b.date.localeCompare(a.date))) {
    const month = prettyDate(item.date, { month: 'long', year: 'numeric' });
    groups.set(month, [...(groups.get(month) ?? []), item]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
        <Text style={styles.title}>History</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/recap')}><Text style={styles.link}>Year</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        <View style={styles.stats}>
          <Stat label="Days together" value={String(state ? streak(state) : 0)} />
          <Stat label="Moments shared" value={String(shared.filter((item) => item.partner.trim()).length)} />
        </View>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search answers" placeholderTextColor={colors.placeholder} style={styles.search} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags}>
          <Tag label="All" on={tag === ''} onPress={() => setTag('')} />
          {tags.map((item) => <Tag key={item} label={item} on={tag === item} onPress={() => setTag(item)} />)}
        </ScrollView>
        {filtered.length === 0 ? <Text style={styles.empty}>Your Moments will gather here.</Text> : null}
        {[...groups.entries()].map(([month, items]) => (
          <View key={month}>
            <Text style={styles.month}>{month}</Text>
            {items.map((item) => {
              const prompt = catalog[item.index];
              return (
                <Pressable key={item.date + item.index} accessibilityRole="button" onPress={() => app.setModal({ name: 'memory', date: item.date })} style={styles.card}>
                  <Text style={styles.date}>{prettyDate(item.date, { month: 'short', day: 'numeric' })}{item.repaired ? ' · added later' : ''}</Text>
                  <Text style={styles.prompt}>{prompt?.prompt}</Text>
                  <View style={styles.pair}>
                    <View style={[styles.side, { backgroundColor: colors.blue }]}>
                      <Text style={styles.who}>{state?.me}</Text>
                      <Text style={styles.words}>{item.me}</Text>
                    </View>
                    <View style={[styles.side, { backgroundColor: colors.lavender }]}>
                      <Text style={styles.who}>{state?.partner}</Text>
                      <Text style={styles.words}>{item.partner.trim() ? item.partner : 'Still open'}</Text>
                    </View>
                  </View>
                  <Pressable accessibilityRole="button" onPress={() => app.addReaction(item.date)} style={styles.heart}>
                    <Text style={styles.heartText}>♥ {item.reactions ?? 0}</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Tag({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.tag, on && styles.tagOn]}>
      <Text style={[styles.tagText, on && styles.tagTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  title: { fontFamily: serif, fontSize: 20, color: colors.ink },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 12 },
  statValue: { fontFamily: serif, fontSize: 28, color: colors.ink },
  statLabel: { color: colors.muted, fontSize: 12 },
  search: { marginTop: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 12, minHeight: 44, paddingHorizontal: 12, color: colors.ink },
  tags: { gap: 8, paddingVertical: 12 },
  tag: { paddingHorizontal: 12, minHeight: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, justifyContent: 'center' },
  tagOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  tagText: { color: colors.muted },
  tagTextOn: { color: colors.ink, fontWeight: '700' },
  empty: { color: colors.muted, fontSize: 15, marginTop: 8 },
  month: { marginTop: 8, marginBottom: 8, color: colors.muted, fontWeight: '700', letterSpacing: 0.4 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 10 },
  date: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  prompt: { fontFamily: serif, fontSize: 20, lineHeight: 26, color: colors.ink, marginTop: 4 },
  pair: { flexDirection: 'row', gap: 8, marginTop: 10 },
  side: { flex: 1, borderRadius: 12, padding: 10 },
  who: { fontSize: 11, fontWeight: '700', color: colors.ink },
  words: { color: colors.ink, marginTop: 4, lineHeight: 18 },
  heart: { marginTop: 8, alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  heartText: { color: colors.primary, fontWeight: '700' },
});
