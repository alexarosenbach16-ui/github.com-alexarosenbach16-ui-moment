import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MiniAvatar, PrimaryButton, TabScreen } from '@/components/ui';
import { catalog } from '@/data/catalog';
import { prettyDate, reflectionRecord, showSundayCard, streak } from '@/data/logic';
import { samplePartner } from '@/services/partnerSync';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function TodayScreen() {
  const app = useApp();
  const state = app.state;
  if (!app.ready || !state) return <Loading />;
  const item = catalog[state.index];
  const done = !!(state.answer && state.partnerDone);
  const waiting = !!state.answer && !state.partnerDone;
  const reflection = reflectionRecord(state);
  const update = samplePartner.dailyUpdate();

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
        <Text style={styles.subtitle}>You don’t have to do everything. Just find a little connection.</Text>
        {showSundayCard(state.date, app.sundayPreview) ? (
          <LinearGradient colors={['#edf1ff', '#f6effc']} style={styles.sunday}>
            <Text style={styles.kicker}>{app.sundayPreview ? 'SUNDAY PREVIEW' : 'OUR SUNDAY RITUAL'} · 5 MIN</Text>
            <Text style={styles.sundayTitle}>A little look back.</Text>
            <Text style={styles.sundayCopy}>What made you feel loved? What could feel better next week?</Text>
            <PrimaryButton
              label={reflection.revealed ? 'Read our reflection' : reflection.submitted ? 'View our reflection' : 'Reflect on our week'}
              onPress={() => app.openWeekly()}
            />
          </LinearGradient>
        ) : null}
        <LinearGradient colors={['#f0f5ff', '#f3effb']} style={styles.moment}>
          <View style={styles.momentMeta}>
            <Text style={styles.kicker}>TODAY’S MOMENT</Text>
            <Text style={styles.metaRight}>{done ? 'Both finished' : waiting ? 'Your part is saved' : '2–5 min'}</Text>
          </View>
          <Text style={styles.momentTitle}>{done ? 'You made time for each other.' : waiting ? 'A little anticipation.' : item.prompt}</Text>
          <Text style={styles.momentCopy}>{done ? 'Your shared Moment is saved for you.' : waiting ? 'Ready to open when you’ve both finished.' : `${item.type} · A little way to connect today.`}</Text>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton label={done ? 'Open our Moment' : waiting ? 'View our Moment' : 'Make a little time'} onPress={() => app.setModal({ name: 'moment' })} />
          </View>
        </LinearGradient>
        <View style={styles.partner}>
          <MiniAvatar letter={state.partner.charAt(0).toUpperCase()} lilac />
          <View style={{ flex: 1 }}>
            <View style={styles.partnerTop}>
              <Text style={styles.partnerName}>{state.partner}’s day</Text>
              <Text style={styles.sample}>Sample update</Text>
            </View>
            <Text style={styles.partnerCopy}>{update.summary}</Text>
            <Pressable accessibilityRole="button" onPress={() => app.setModal({ name: 'partner-update' })} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>See what they shared</Text>
              <Icon name="chevron" size={14} color="#8a88ad" />
            </Pressable>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={app.openWellbeing} style={styles.need}>
          <Icon name="heart" size={16} color="#8a8eab" />
          <Text style={styles.needText}>Let {state.partner} know what I need</Text>
          <Icon name="arrow" size={16} color="#8a8eab" />
        </Pressable>
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
  subtitle: { color: '#8d96aa', fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 320 },
  sunday: { borderRadius: 22, padding: 20, marginTop: 20, borderWidth: 1, borderColor: '#deddf1' },
  kicker: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: '#9a97b5' },
  sundayTitle: { fontFamily: serif, fontSize: 28, color: colors.ink, marginTop: 8 },
  sundayCopy: { color: '#66718b', fontSize: 14, lineHeight: 21, marginTop: 6, marginBottom: 16 },
  moment: { marginTop: 18, borderRadius: 22, padding: 22, borderWidth: 1, borderColor: '#e6e6f2' },
  momentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRight: { color: '#9a97b5', fontSize: 12 },
  momentTitle: { fontFamily: serif, fontSize: 26, lineHeight: 32, color: colors.ink, marginTop: 14 },
  momentCopy: { color: '#8e96ac', fontSize: 13, lineHeight: 20, marginTop: 8 },
  partner: { marginTop: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', gap: 12 },
  partnerTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  partnerName: { fontSize: 15, fontWeight: '500', color: colors.ink },
  sample: { fontSize: 11, color: '#a19bb5' },
  partnerCopy: { color: '#8c95aa', fontSize: 14, lineHeight: 20, marginTop: 4 },
  textButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 4 },
  textButtonLabel: { color: '#8a88ad', fontSize: 13, fontWeight: '600' },
  need: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  needText: { flex: 1, color: '#8a8eab', fontSize: 14 },
});
