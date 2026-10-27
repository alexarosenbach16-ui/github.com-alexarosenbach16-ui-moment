import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PrimaryButton, TabScreen, TextField } from '@/components/ui';
import { catalog } from '@/data/catalog';
import { prettyDate, repairTarget, streakInfo, todayTodo, waitOver, wellbeingFor } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function TodayScreen() {
  const app = useApp();
  const router = useRouter();
  const state = app.state;
  const [repairText, setRepairText] = useState('');
  const [repairOpen, setRepairOpen] = useState(false);
  if (!app.ready || !state) return <View style={styles.loading}><Text style={styles.word}>moment</Text></View>;

  const info = streakInfo(state);
  const mood = wellbeingFor(state).mood;
  const todo = todayTodo(state);
  const steps = [
    { id: 'answer', title: 'Answer today’s question', detail: state.answer ? 'Saved' : '~1 min', done: !!state.answer, action: 'Answer', open: () => app.setModal({ name: 'moment' }) },
    { id: 'mood', title: 'Check in your mood', detail: mood || 'One tap', done: !!mood, action: 'Check in', open: () => app.setModal({ name: 'mood' }) },
    { id: 'together', title: 'Do one thing together', detail: todo?.title || 'Pick one', done: !!todo, action: 'Pick one thing', open: () => app.setModal({ name: 'together' }) },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const next = steps.findIndex((step) => !step.done);
  const repairDay = repairTarget(state);
  const saved = !!state.answer && !state.partnerDone;
  const waitingOnYou = state.partnerAnswered && !state.answer;

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <View>
            <Text style={styles.kicker}>{prettyDate(state.date, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
            <Text style={styles.streak}>{info.count}</Text>
            <Text style={styles.streakLabel}>days together</Text>
          </View>
          {info.graceDate ? (
            <View style={styles.grace}>
              <Icon name="shield" size={16} color={colors.primary} />
              <Text style={styles.graceText}>Grace day used</Text>
            </View>
          ) : null}
        </View>

        {waitingOnYou ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>{state.partner}’s waiting on you, takes 1 min</Text>
            <PrimaryButton label="Answer" onPress={() => app.setModal({ name: 'moment' })} />
          </View>
        ) : null}

        {!state.paired ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/invite')} style={[styles.card, !waitingOnYou && styles.primaryCard]}>
            <Text style={styles.step}>Invite {state.partner}</Text>
            <Text style={styles.detail}>{state.partner} answered today’s question. Pair to see it.</Text>
            <View style={{ marginTop: 12 }}><PrimaryButton label={`Invite ${state.partner}`} onPress={() => router.push('/invite')} /></View>
          </Pressable>
        ) : null}

        {saved ? (
          <View style={styles.saved}>
            <Text style={styles.step}>Your answer is saved.</Text>
            <Text style={styles.detail}>{waitOver(state) ? 'You can open the next question.' : `${state.partner} can add an answer whenever. No rush.`}</Text>
            {waitOver(state) ? <View style={{ marginTop: 12 }}><PrimaryButton label="Next question" onPress={app.releaseToday} /></View> : null}
          </View>
        ) : null}

        {repairDay ? (
          <View style={styles.repair}>
            <Text style={styles.step}>Yesterday’s question is still open.</Text>
            <Text style={styles.detail}>Answer it if you’d like it in your streak.</Text>
            {repairOpen ? (
              <View style={{ marginTop: 10, gap: 8 }}>
                <TextField value={repairText} maxLength={80} placeholder="A few words" onChangeText={setRepairText} />
                <PrimaryButton label="Save yesterday" onPress={() => app.repairYesterday(repairText)} />
              </View>
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setRepairOpen(true)} style={styles.textBtn}><Text style={styles.textBtnLabel}>Answer it</Text></Pressable>
            )}
          </View>
        ) : null}

        {doneCount === 3 ? (
          <LinearGradient colors={[colors.blue, colors.lavender]} style={styles.done}>
            <Text style={styles.doneTitle}>You’re done for today</Text>
            <Text style={styles.doneCopy}>{info.count} days together.</Text>
          </LinearGradient>
        ) : (
          <Text style={styles.progress}>{doneCount} of 3 done</Text>
        )}
        <View style={styles.dots}>
          {steps.map((step, index) => <View key={step.id} style={[styles.dot, step.done && styles.dotOn, index === next && styles.dotNext]} />)}
        </View>

        {steps.map((step, index) => {
          const primary = index === next && doneCount < 3;
          if (step.done) {
            return (
              <Pressable key={step.id} accessibilityRole="button" onPress={step.open} style={styles.doneRow}>
                <View style={styles.check}><Icon name="check" size={14} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doneLabel}>{step.title}</Text>
                  <Text style={styles.detail}>{step.detail}</Text>
                </View>
              </Pressable>
            );
          }
          return (
            <View key={step.id} style={[styles.card, primary && styles.primaryCard]}>
              <Text style={styles.step}>{step.title}</Text>
              <Text style={styles.detail}>{step.detail}</Text>
              {primary ? <View style={{ marginTop: 12 }}><PrimaryButton label={step.action} onPress={step.open} /></View> : (
                <Pressable accessibilityRole="button" onPress={step.open} style={styles.textBtn}><Text style={styles.textBtnLabel}>{step.action}</Text></Pressable>
              )}
            </View>
          );
        })}
        <Text style={styles.prompt} numberOfLines={2}>{catalog[state.index]?.prompt}</Text>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  word: { fontFamily: serif, fontSize: 32, color: colors.ink },
  content: { paddingHorizontal: 22, paddingBottom: 28 },
  top: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kicker: { color: colors.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  streak: { fontFamily: serif, fontSize: 48, lineHeight: 52, color: colors.ink },
  streakLabel: { color: colors.muted, fontSize: 14 },
  grace: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.lavender, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8 },
  graceText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  banner: { marginTop: 16, backgroundColor: colors.lavender, borderRadius: 18, padding: 16, gap: 10 },
  bannerTitle: { fontFamily: serif, fontSize: 26, lineHeight: 32, color: colors.ink },
  progress: { marginTop: 18, color: colors.ink, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.lavender },
  dotNext: { backgroundColor: colors.primary },
  card: { marginTop: 12, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16 },
  primaryCard: { backgroundColor: colors.blue, borderColor: colors.blue },
  step: { fontFamily: serif, fontSize: 24, lineHeight: 30, color: colors.ink },
  detail: { color: colors.muted, fontSize: 14, marginTop: 4 },
  done: { marginTop: 18, borderRadius: 18, padding: 18 },
  doneTitle: { fontFamily: serif, fontSize: 30, lineHeight: 36, color: colors.ink },
  doneCopy: { color: colors.ink, marginTop: 4, fontSize: 15 },
  doneRow: { marginTop: 10, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 12 },
  check: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  doneLabel: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  saved: { marginTop: 12, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16 },
  repair: { marginTop: 12, backgroundColor: colors.lavender, borderRadius: 18, padding: 16 },
  textBtn: { minHeight: 40, justifyContent: 'center' },
  textBtnLabel: { color: colors.primary, fontWeight: '700' },
  prompt: { marginTop: 16, color: colors.muted, fontSize: 13, lineHeight: 18 },
});
