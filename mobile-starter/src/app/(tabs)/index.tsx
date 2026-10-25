import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TaskList } from '@/components/TaskList';
import { PrimaryButton, TabScreen } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { WELLBEING_MOODS, catalog } from '@/data/catalog';
import { prettyDate, streak, wellbeingFor } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function TodayScreen() {
  const app = useApp();
  const state = app.state;
  if (!app.ready || !state) return <Loading />;
  const item = catalog[state.index];
  const done = !!(state.answer && state.partnerDone);
  const waiting = !!state.answer && !state.partnerDone;
  const checkIn = wellbeingFor(state);

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topline}>
          <Text style={styles.date}>{prettyDate(state.date, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
          <View style={styles.streak}>
            <Icon name="leaf" size={14} color="#9392ae" />
            <Text style={styles.streakText}>{streak(state)} days together</Text>
          </View>
        </View>
        <Text style={styles.title}>
          A little space{'\n'}
          <Text style={styles.em}>for us.</Text>
        </Text>
        <LinearGradient colors={[colors.blue, colors.lavender]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.moment}>
          <View style={styles.momentMeta}>
            <Text style={styles.kicker}>TODAY’S QUESTION</Text>
            <Text style={styles.metaRight}>{done ? 'Both finished' : waiting ? 'Your part is saved' : '2–5 min'}</Text>
          </View>
          <Text style={styles.momentTitle}>{done ? 'You made time for each other.' : waiting ? 'A little anticipation.' : item.prompt}</Text>
          <Text style={styles.momentCopy}>{done ? 'Your shared Moment is saved for you.' : waiting ? 'Ready to open when you’ve both finished.' : `${item.type} · A little way to connect today.`}</Text>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton label={done ? 'Open our Moment' : waiting ? 'View our Moment' : 'Answer today’s question'} onPress={() => app.setModal({ name: 'moment' })} />
          </View>
        </LinearGradient>
        <Text style={styles.sectionLabel}>MOOD CHECK-IN</Text>
        <Text style={styles.sectionCopy}>How are you feeling? This stays on your phone until you choose to share it.</Text>
        <View style={styles.moods}>
          {WELLBEING_MOODS.map((mood) => {
            const selected = checkIn.mood === mood;
            return (
              <Pressable key={mood} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => app.setTodayMood(mood)} style={[styles.mood, selected && styles.moodOn]}>
                <Text style={[styles.moodText, selected && styles.moodTextOn]}>{mood}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable accessibilityRole="button" onPress={app.openWellbeing} style={styles.need}>
          <Icon name="heart" size={16} color="#8a8eab" />
          <Text style={styles.needText}>{checkIn.need.trim() ? checkIn.need.trim() : `Add a need, or choose what ${state.partner} can see`}</Text>
          <Icon name="chevron" size={16} color="#8a8eab" />
        </Pressable>
        <TaskList />
      </ScrollView>
    </TabScreen>
  );
}

function Loading() {
  return (
    <View style={styles.loading}>
      <Text style={styles.title}>moment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingBottom: 36 },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, gap: 8 },
  date: { color: '#9099ab', fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase', flex: 1 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { color: '#9392ae', fontSize: 12 },
  title: { fontFamily: serif, fontSize: 36, lineHeight: 40, color: colors.ink, marginTop: 16 },
  em: { fontFamily: serif, fontStyle: 'italic', color: colors.em },
  moment: { marginTop: 18, borderRadius: 22, padding: 22 },
  momentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: colors.ink },
  metaRight: { color: colors.ink, fontSize: 12 },
  momentTitle: { fontFamily: serif, fontSize: 26, lineHeight: 32, color: colors.ink, marginTop: 14 },
  momentCopy: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 8, opacity: 0.8 },
  sectionLabel: { marginTop: 26, fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: '#8a94a9' },
  sectionCopy: { color: '#8d96aa', fontSize: 14, lineHeight: 20, marginTop: 8 },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  mood: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  moodOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  moodText: { color: '#7d869c', fontSize: 14 },
  moodTextOn: { color: colors.ink, fontWeight: '600' },
  need: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  needText: { flex: 1, color: '#8a8eab', fontSize: 14 },
});
