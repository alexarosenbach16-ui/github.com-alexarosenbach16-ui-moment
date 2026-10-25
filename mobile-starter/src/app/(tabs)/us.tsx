import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Foundations } from '@/components/ModalHost';
import { Icon } from '@/components/Icon';
import { PageHeading, SecondaryButton, TabScreen } from '@/components/ui';
import { focusOptions, streak } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function UsScreen() {
  const app = useApp();
  const state = app.state;
  if (!app.ready || !state) return <View style={styles.fill} />;
  const focuses = focusOptions(state);
  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeading kicker="THE TWO OF YOU" title="Our own" accent="little corner." subtitle="A shared habit. A little intention. A whole lot of us." />
        <View style={styles.card}>
          <View style={styles.couple}>
            <View style={[styles.big, { backgroundColor: '#e9f0fd' }]}>
              <Text style={styles.bigLetter}>{state.me.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={[styles.big, styles.overlap, { backgroundColor: '#eee7fb' }]}>
              <Text style={[styles.bigLetter, { color: '#a08cbf' }]}>{state.partner.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.names}>{state.me} & {state.partner}</Text>
          <View style={styles.connected}>
            <View style={styles.green} />
            <Text style={styles.connectedText}>Connected sample couple</Text>
          </View>
          <View style={styles.stats}>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={styles.statValue}>{streak(state)}</Text>
              <Text style={styles.statLabel}>day shared streak</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.history.length}</Text>
              <Text style={styles.statLabel}>Moments together</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => app.setModal({ name: 'edit' })}>
            <Text style={styles.edit}>Make the demo yours</Text>
          </Pressable>
        </View>
        <View style={styles.focus}>
          <View style={styles.focusTop}>
            <Text style={styles.kicker}>WHAT WE’RE FOCUSING ON</Text>
            <Icon name="leaf" size={18} color="#9b96ba" />
          </View>
          <Text style={styles.focusTitle}>{focuses.length ? 'Our relationship, our pace.' : 'Every season is welcome here.'}</Text>
          <View style={styles.tags}>
            {(focuses.length ? focuses.map((item) => item.short) : ['Choose what would help you two']).map((label) => (
              <Text key={label} style={styles.tag}>{label}</Text>
            ))}
          </View>
          <Text style={styles.focusCopy}>Update this as life changes. Your memories, tasks, and progress stay with you.</Text>
          <SecondaryButton label={focuses.length ? 'Update our focus' : 'Choose our focus'} icon="arrow" onPress={() => app.setModal({ name: 'focus', first: false })} />
        </View>
        <Foundations />
        <Text style={styles.groupLabel}>A LITTLE ROUTINE</Text>
        <View style={styles.group}>
          <SettingSwitch title="Your daily Moment" detail="Reminder preview · no notification is sent" on={state.reminders} onPress={() => app.toggleSetting('reminders')} />
          <SettingSwitch title="A gentle evening nudge" detail="Reminder preview · no notification is sent" on={state.evening} onPress={() => app.toggleSetting('evening')} />
        </View>
        <Text style={styles.groupLabel}>YOUR SHARED SPACE</Text>
        <View style={styles.group}>
          <SettingRow title="Partner pairing preview" detail="Try the sample partner code" onPress={() => app.setModal({ name: 'pair' })} />
          <SettingRow title="Privacy & this demo" detail="What’s real, and what’s a preview" onPress={() => app.setModal({ name: 'privacy' })} />
          <SettingRow title="Reset demo" detail="Start again with sample data" onPress={() => app.setModal({ name: 'reset' })} />
        </View>
        <Text style={styles.groupLabel}>MY DAY, MY CHOICE</Text>
        <View style={styles.group}>
          <SettingRow title="Wellbeing & sharing" detail="Choose what your partner would see" onPress={app.openWellbeing} />
          <SettingRow title="Wearable preview" detail="Oura sample data · no device connected" onPress={() => app.openWearable(true)} />
          <SettingRow title="Hangout debrief" detail="A private reflection, with optional sharing" onPress={() => app.setModal({ name: 'debrief' })} />
        </View>
        <Text style={styles.footer}>Moment · One small moment every day.</Text>
      </ScrollView>
    </TabScreen>
  );
}

function SettingSwitch({ title, detail, on, onPress }: { title: string; detail: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <View style={[styles.toggle, on && styles.toggleOn]}>
        <View style={[styles.knob, on && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

function SettingRow({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Icon name="chevron" size={16} color="#a1a7b7" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 22, paddingBottom: 40 },
  card: { marginTop: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 21, padding: 24, alignItems: 'center' },
  couple: { flexDirection: 'row', marginBottom: 12 },
  big: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  overlap: { marginLeft: -10, borderWidth: 3, borderColor: '#fff' },
  bigLetter: { fontFamily: serif, fontSize: 28, color: '#7c8fba' },
  names: { fontFamily: serif, fontSize: 28, color: colors.ink, textAlign: 'center' },
  connected: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  green: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8fad9b' },
  connectedText: { color: '#789787', fontSize: 12 },
  stats: { flexDirection: 'row', marginTop: 18, alignSelf: 'stretch' },
  stat: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: colors.line },
  statValue: { fontFamily: serif, fontSize: 30, color: colors.ink },
  statLabel: { color: '#929bb0', fontSize: 12, marginTop: 4, textAlign: 'center' },
  edit: { color: '#8891af', textDecorationLine: 'underline', marginTop: 16, fontSize: 14 },
  focus: { marginTop: 18, padding: 20, borderRadius: 20, backgroundColor: '#f4f2fb', borderWidth: 1, borderColor: '#e9e7f2' },
  focusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: '#9b96ba' },
  focusTitle: { fontFamily: serif, fontSize: 26, color: colors.ink, marginTop: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#e3e3f0', color: '#8682a6', fontSize: 13, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, overflow: 'hidden' },
  focusCopy: { color: '#8b94aa', fontSize: 14, lineHeight: 21, marginVertical: 14 },
  groupLabel: { marginTop: 26, marginBottom: 10, fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: '#969eaf' },
  group: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 16, overflow: 'hidden' },
  row: { minHeight: 68, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowTitle: { fontSize: 15, color: colors.ink },
  rowDetail: { color: '#99a1b1', fontSize: 12, marginTop: 3 },
  toggle: { width: 42, height: 26, borderRadius: 13, backgroundColor: '#dfe2ed', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: '#a6a4cd' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  footer: { textAlign: 'center', color: '#a0a6b4', marginTop: 28, fontSize: 12 },
});
