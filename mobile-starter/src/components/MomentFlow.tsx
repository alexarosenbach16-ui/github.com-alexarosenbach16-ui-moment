import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { FlipAnswer, HeartBurst, SealedCard } from '@/components/Reveal';
import { ChoiceButton, PrimaryButton, SecondaryButton, TextField } from '@/components/ui';
import { catalog } from '@/data/catalog';
import { prettyDate, streak } from '@/data/logic';
import type { HistoryItem } from '@/data/types';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export function MomentFlow({ record }: { record?: HistoryItem }) {
  const app = useApp();
  const state = app.state;
  if (!state) return null;
  const item = catalog[record?.index ?? state.index];
  const mine = record ? record.me : state.answer;
  const theirs = record ? record.partner : item.partner;
  const revealed = record ? true : state.revealed;
  const partnerDone = record ? true : state.partnerDone;

  if (revealed) {
    return <RevealPayoff prompt={item.prompt} mine={mine} theirs={theirs} me={state.me} partner={state.partner} same={mine === theirs && item.type === 'Choice'} record={!!record} date={record?.date ?? state.date} />;
  }

  if (partnerDone && state.answer) {
    return (
      <View>
        <SealedCard title="Both answers are in." detail="Open them together." />
        <PrimaryButton label="Reveal our Moment" onPress={app.revealMoment} />
        <Text style={styles.footer}>{streak(state)} days together.</Text>
      </View>
    );
  }

  if (state.answer && !record) {
    return (
      <View>
        <SealedCard title="Your answer is saved." detail={app.waitIsOver ? 'You can open the next question.' : `${state.partner} can add an answer whenever. No rush.`} />
        {app.waitIsOver ? <PrimaryButton label="Next question" onPress={app.releaseToday} /> : <DemoHint text="This phone can pretend your partner is done." action={`${state.partner} finished`} onPress={app.partnerCompletes} />}
      </View>
    );
  }

  const needsDraft = item.type !== 'Action' && !state.draft.trim();
  const sealTitle = state.partnerAnswered ? `${state.partner} answered, your answer unlocks it` : 'Sealed until you both answer.';
  const sealDetail = state.partnerAnswered ? `${state.partner}’s waiting on you, takes 1 min` : 'One tap, or a few words.';
  return (
    <View>
      <SealedCard title={sealTitle} detail={sealDetail} />
      <View style={styles.meta}>
        <Text style={styles.kicker}>{prettyDate(state.date, { month: 'short', day: 'numeric' })}</Text>
        <View style={styles.duration}>
          <Icon name="clock" size={13} color="#969eae" />
          <Text style={styles.durationText}>~1 min</Text>
        </View>
      </View>
      <View style={styles.typeRow}>
        <Icon name={item.icon} size={15} color="#8382ab" />
        <Text style={styles.typeText}>{item.type}</Text>
      </View>
      <Text style={styles.question}>{item.prompt}</Text>
      <Text style={styles.note}>{item.note}</Text>
      {item.type === 'Choice' ? (
        <View style={{ gap: 9, marginTop: 18 }}>
          {item.options?.map((option) => (
            <ChoiceButton key={option} label={option} selected={state.draft === option} onPress={() => app.setDraft(option)} />
          ))}
        </View>
      ) : null}
      {item.type === 'Check-in' ? (
        <View>
          <View style={styles.rating}>
            {[1, 2, 3, 4, 5].map((n) => {
              const value = `${n} out of 5`;
              const selected = state.draft === value;
              return (
                <Pressable key={n} accessibilityLabel={`${n} out of 5`} accessibilityState={{ selected }} onPress={() => app.setDraft(value)} style={[styles.rate, selected && styles.rateOn]}>
                  <Text style={styles.rateText}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.rateEnds}>
            <Text style={styles.rateEnd}>A little distant</Text>
            <Text style={styles.rateEnd}>Really connected</Text>
          </View>
        </View>
      ) : null}
      {item.type === 'Action' ? (
        <View>
          <View style={styles.actionArt}>
            <Icon name="heart" size={36} color="#a7a7cf" />
          </View>
          <Text style={[styles.note, { marginBottom: 16 }]}>Take a minute to do it, then mark your part complete.</Text>
        </View>
      ) : null}
      {item.chips?.length ? (
        <View style={styles.chips}>
          {item.chips.map((chip) => (
            <Pressable key={chip} accessibilityRole="button" accessibilityState={{ selected: state.draft === chip }} onPress={() => app.setDraft(chip)} style={[styles.chip, state.draft === chip && styles.chipOn]}>
              <Text style={[styles.chipText, state.draft === chip && styles.chipTextOn]}>{chip}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {item.type !== 'Choice' && item.type !== 'Check-in' && item.type !== 'Action' ? (
        <View style={{ marginTop: 14 }}>
          <TextField value={item.chips?.includes(state.draft) ? '' : state.draft} maxLength={80} placeholder={item.hint || 'Or a few words'} onChangeText={app.setDraft} />
        </View>
      ) : null}
      <PrimaryButton label={state.partnerAnswered ? 'Unlock our reveal' : item.type === 'Action' ? 'I did my part' : 'Save my answer'} disabled={needsDraft} onPress={app.submitAnswer} />
      {!state.partnerAnswered ? <DemoHint text="Or let the sample partner go first." action={`${state.partner} finished`} onPress={app.partnerCompletes} /> : null}
    </View>
  );
}

function RevealPayoff({ prompt, mine, theirs, me, partner, same, record, date }: { prompt: string; mine: string; theirs: string; me: string; partner: string; same: boolean; record: boolean; date: string }) {
  const app = useApp();
  const [hearts, setHearts] = useState(0);
  const share = () => {
    void Share.share({ message: `${prompt}\n${me}: ${mine}\n${partner}: ${theirs}\nA little Moment, together.` });
  };
  return (
    <View>
      <Text style={styles.revealTitle}>You made time for each other.</Text>
      <Text style={styles.note}>{prompt}</Text>
      <View style={styles.revealStage}>
        <FlipAnswer label={me} text={mine} delay={80} />
        <FlipAnswer label={partner} text={theirs} lilac delay={420} />
        <HeartBurst extra={hearts} />
      </View>
      {same ? <Text style={styles.match}>A little match. You’re on the same page.</Text> : null}
      <View style={styles.reactRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Send a heart" onPress={() => { setHearts((count) => count + 1); app.addReaction(date); }} style={styles.heartButton}>
          <Icon name="heart" size={18} color={colors.primary} />
          <Text style={styles.heartLabel}>{hearts ? `${hearts} ${hearts === 1 ? 'heart' : 'hearts'}` : 'Send a heart'}</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 12, gap: 10 }}>
        <PrimaryButton label="Share this Moment" icon="arrow" onPress={share} />
        {record ? (
          <SecondaryButton label="Keep this memory" onPress={app.closeModal} />
        ) : (
          <SecondaryButton label="See our History" icon="arrow" onPress={() => { app.closeModal(); app.openHistory(); }} />
        )}
      </View>
      {!record && app.state ? <Text style={styles.footer}>{streak(app.state)} days together.</Text> : null}
    </View>
  );
}

function Response({ label, text, lilac = false }: { label: string; text: string; lilac?: boolean }) {
  return (
    <View style={[styles.response, lilac && styles.responseLilac]}>
      <Text style={[styles.responseLabel, lilac && { color: '#998bb7' }]}>{label}</Text>
      <Text style={styles.responseText}>{text}</Text>
    </View>
  );
}

function PartnerStrip() {
  const { state } = useApp();
  if (!state) return null;
  return (
    <View style={styles.strip}>
      <Status name={state.me} done={!!state.answer} letter={state.me.charAt(0)} />
      <Status name={state.partner} done={state.partnerDone} letter={state.partner.charAt(0)} lilac />
    </View>
  );
}

function Status({ name, done, letter, lilac = false }: { name: string; done: boolean; letter: string; lilac?: boolean }) {
  return (
    <View style={styles.status}>
      <View style={[styles.dotAvatar, lilac && { backgroundColor: '#eee9fc' }]}>
        <Text style={styles.dotLetter}>{letter.toUpperCase()}</Text>
      </View>
      <Text style={styles.statusName} numberOfLines={1}>{name}</Text>
      <View style={[styles.dot, done && styles.dotOn]} />
      <Text style={[styles.statusState, done && styles.statusDone]}>{done ? 'Done' : lilac ? 'Not yet' : 'Your turn'}</Text>
    </View>
  );
}

function DemoHint({ text, action, onPress }: { text: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.demo}>
      <Text style={styles.demoText}>{text}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.demoButton}>
        <Text style={styles.demoAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontSize: 11, letterSpacing: 1.2, color: '#8a91a9', fontWeight: '600' },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { color: '#969eae', fontSize: 12 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 },
  typeText: { color: '#8382ab', fontSize: 13 },
  question: { fontFamily: serif, fontSize: 28, lineHeight: 34, color: colors.ink, marginTop: 10 },
  note: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  answerLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: '#7f89a0', marginBottom: 8 },
  hintRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  hint: { color: '#9199ad', fontSize: 12 },
  art: { width: 82, height: 82, borderRadius: 41, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2fc', marginVertical: 12 },
  waitTitle: { fontFamily: serif, fontSize: 28, textAlign: 'center', color: colors.ink },
  waitCopy: { textAlign: 'center', color: colors.muted, fontSize: 14, lineHeight: 21, marginVertical: 12 },
  saved: { backgroundColor: '#f7f8fc', borderWidth: 1, borderColor: '#eceef5', borderRadius: 12, padding: 14, marginBottom: 8 },
  savedLabel: { fontSize: 11, letterSpacing: 1, color: '#929bb0', fontWeight: '600', marginBottom: 6 },
  savedText: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  demo: { marginTop: 14, backgroundColor: '#f0eff9', borderWidth: 1, borderStyle: 'dashed', borderColor: '#d5d1e9', borderRadius: 12, padding: 12, alignItems: 'center' },
  demoText: { color: '#8a88a3', fontSize: 12, marginBottom: 4 },
  demoButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  demoAction: { color: '#7773a5', fontWeight: '600', fontSize: 14 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#edf4ef', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, marginTop: 8 },
  pillText: { color: '#73907e', fontSize: 11, fontWeight: '600' },
  revealTitle: { fontFamily: serif, fontSize: 28, lineHeight: 34, color: colors.ink, marginTop: 14 },
  revealStage: { position: 'relative', overflow: 'hidden' },
  response: { backgroundColor: '#f2f5fd', borderRadius: 13, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#eaf0fc' },
  responseLilac: { backgroundColor: '#f5f1fc', borderColor: '#f0eafa' },
  responseLabel: { fontSize: 11, letterSpacing: 0.6, color: '#8190ad', fontWeight: '600', marginBottom: 6 },
  responseText: { fontFamily: serif, fontSize: 18, lineHeight: 26, color: colors.ink },
  match: { textAlign: 'center', backgroundColor: '#f0eef9', color: '#8a80ac', padding: 12, borderRadius: 11, marginTop: 12, fontSize: 13 },
  footer: { textAlign: 'center', color: '#8993a7', fontSize: 13, marginTop: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: { minHeight: 40, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  chipText: { color: colors.muted, fontSize: 14 },
  chipTextOn: { color: colors.ink, fontWeight: '600' },
  reactRow: { marginTop: 16, alignItems: 'flex-start' },
  heartButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 22, backgroundColor: colors.lavender },
  heartLabel: { color: colors.ink, fontWeight: '600' },
  modalNote: { textAlign: 'center', color: '#a1a7b7', fontSize: 12, lineHeight: 18, marginTop: 16 },
  strip: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 18, paddingTop: 14 },
  status: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dotAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e8edfc', alignItems: 'center', justifyContent: 'center' },
  dotLetter: { fontSize: 10, fontWeight: '600', color: '#7c8bb0' },
  statusName: { flexShrink: 1, fontSize: 11, color: colors.ink },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#c8ccda' },
  dotOn: { backgroundColor: '#91ad9e' },
  statusState: { fontSize: 11, color: '#939aad' },
  statusDone: { color: '#6e8b7c' },
  rating: { flexDirection: 'row', gap: 8, marginTop: 18 },
  rate: { flex: 1, minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: '#e0e4ee', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  rateOn: { backgroundColor: '#eae7f8', borderColor: '#b7aedc' },
  rateText: { fontFamily: serif, fontSize: 22, color: colors.ink },
  rateEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  rateEnd: { fontSize: 11, color: '#939aad' },
  actionArt: { height: 90, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#ddd9ec', backgroundColor: '#f8f6ff', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
});
