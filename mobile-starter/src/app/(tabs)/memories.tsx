import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PageHeading, SecondaryButton, TabScreen } from '@/components/ui';
import { catalog } from '@/data/catalog';
import { prettyDate, revealedReflections, sharedDebrief } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function MemoriesScreen() {
  const app = useApp();
  const state = app.state;
  if (!app.ready || !state) return <View style={styles.fill} />;
  const list = [...state.history].sort((a, b) => b.date.localeCompare(a.date));
  const weeks = revealedReflections(state);
  const debriefs = [...state.debriefs].reverse();
  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeading kicker="OUR MEMORIES" title="Little moments." accent="A story of us." subtitle="The things you shared. The time you made. Yours to return to." />
        <LinearGradient colors={['#edf3ff', '#f3eefb']} style={styles.intro}>
          <Icon name="book" size={28} color="#a1a1c5" />
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>{list.length} little reasons to feel closer.</Text>
            <Text style={styles.introCopy}>Sample memories and the Moments you complete here.</Text>
          </View>
        </LinearGradient>
        <View style={styles.head}>
          <Text style={styles.label}>YOUR SHARED STORY</Text>
          <Text style={styles.count}>{list.length} Moments</Text>
        </View>
        <View style={{ gap: 10 }}>
          {list.map((memory) => {
            const item = catalog[memory.index];
            return (
              <Pressable key={memory.date} accessibilityRole="button" accessibilityLabel={`Open ${item.title} from ${prettyDate(memory.date, { month: 'long', day: 'numeric' })}`} onPress={() => app.setModal({ name: 'memory', date: memory.date })} style={styles.row}>
                <View style={styles.tile}>
                  <Text style={styles.tileMonth}>{prettyDate(memory.date, { month: 'short' })}</Text>
                  <Text style={styles.tileDay}>{prettyDate(memory.date, { day: 'numeric' })}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.kind}>{item.type} · Both completed</Text>
                  <Text style={styles.prompt}>{item.prompt}</Text>
                </View>
                <Icon name="chevron" size={16} color="#b7b9c8" />
              </Pressable>
            );
          })}
        </View>
        {weeks.length ? (
          <View style={{ marginTop: 28 }}>
            <Text style={styles.sectionTitle}>Our Sunday reflections</Text>
            {weeks.map(([key]) => (
              <Pressable key={key} accessibilityRole="button" onPress={() => app.openWeekly(key)} style={styles.week}>
                <Icon name="heart" size={16} color="#a294bb" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.weekTitle}>A little look back</Text>
                  <Text style={styles.weekCopy}>Week of {prettyDate(key, { month: 'short', day: 'numeric' })} · Both reflected</Text>
                </View>
                <Icon name="chevron" size={16} color="#b9b8ce" />
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={styles.head}>
          <Text style={styles.label}>AFTER OUR TIME TOGETHER</Text>
          <Pressable accessibilityRole="button" onPress={() => app.setModal({ name: 'debrief' })}>
            <Text style={styles.link}>Write a debrief</Text>
          </Pressable>
        </View>
        {debriefs.length ? (
          <View style={{ gap: 10 }}>
            {debriefs.map((debrief) => (
              <Pressable key={debrief.id} accessibilityRole="button" onPress={() => app.setModal({ name: 'debrief-detail', id: debrief.id, partner: false })} style={styles.row}>
                <View style={styles.tile}>
                  <Text style={styles.tileMonth}>{prettyDate(debrief.date, { month: 'short' })}</Text>
                  <Text style={styles.tileDay}>{prettyDate(debrief.date, { day: 'numeric' })}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.kind}>{sharedDebrief(debrief).length ? 'Selected answers shared in preview' : 'Private reflection'}</Text>
                  <Text style={styles.prompt}>{debrief.title}</Text>
                </View>
                <Icon name="chevron" size={16} color="#b7b9c8" />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.debriefEmpty}>
            <Icon name="book" size={26} color="#a9a1c4" />
            <Text style={styles.emptyCopy}>A favorite little part. Something still on your mind. Your reflections can live here.</Text>
            <SecondaryButton label="Write your first debrief" onPress={() => app.setModal({ name: 'debrief' })} />
          </View>
        )}
        <Text style={styles.footer}>Your little archive of showing up for each other.</Text>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 22, paddingBottom: 40 },
  intro: { marginTop: 22, borderRadius: 20, padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center' },
  introTitle: { fontFamily: serif, fontSize: 20, lineHeight: 26, color: colors.ink },
  introCopy: { color: '#8a94a8', fontSize: 13, marginTop: 4 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 12 },
  label: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: '#8a94a9', flex: 1 },
  count: { color: '#9aa2b1', fontSize: 12 },
  link: { color: '#8a88ad', fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 14 },
  tile: { width: 52, height: 54, borderRadius: 12, backgroundColor: '#f4f3fb', alignItems: 'center', justifyContent: 'center' },
  tileMonth: { fontSize: 10, letterSpacing: 0.6, color: '#9995b7', textTransform: 'uppercase' },
  tileDay: { fontFamily: serif, fontSize: 22, color: colors.ink },
  kind: { fontSize: 11, color: '#9992b4', marginBottom: 4 },
  prompt: { fontFamily: serif, fontSize: 18, lineHeight: 24, color: colors.ink },
  sectionTitle: { fontFamily: serif, fontSize: 24, color: colors.ink, marginBottom: 8 },
  week: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, marginTop: 8 },
  weekTitle: { fontSize: 15, color: colors.ink, fontWeight: '500' },
  weekCopy: { color: '#939bb0', fontSize: 13, marginTop: 3 },
  debriefEmpty: { alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#dddaeb', borderRadius: 16, padding: 22, backgroundColor: '#faf9fd' },
  emptyCopy: { color: '#949bb0', textAlign: 'center', marginVertical: 12, fontSize: 14, lineHeight: 20 },
  footer: { textAlign: 'center', color: '#a0a6b4', fontSize: 12, marginTop: 24 },
});
