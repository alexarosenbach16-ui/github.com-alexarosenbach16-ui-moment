import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { TabScreen } from '@/components/ui';
import { streak } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function UsScreen() {
  const app = useApp();
  const router = useRouter();
  const state = app.state;
  if (!app.ready || !state) return <View style={styles.fill} />;
  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>US</Text>
        <View style={styles.card}>
          <View style={styles.couple}>
            <View style={[styles.big, { backgroundColor: colors.blue }]}><Text style={styles.letter}>{state.me.charAt(0).toUpperCase()}</Text></View>
            <View style={[styles.big, styles.overlap, { backgroundColor: colors.lavender }]}><Text style={styles.letter}>{state.partner.charAt(0).toUpperCase()}</Text></View>
          </View>
          <Text style={styles.names}>{state.me} & {state.partner}</Text>
          <Text style={styles.meta}>{streak(state)} days together · {state.paired ? 'Paired' : 'Not paired yet'}</Text>
        </View>
        <Text style={styles.group}>PAIRING</Text>
        <Row title={state.paired ? `Paired with ${state.partner}` : `Invite ${state.partner}`} detail="Sample code MOMENT" onPress={() => router.push('/invite')} />
        <Text style={styles.group}>SETTINGS</Text>
        <View style={styles.list}>
          <Row title="History" detail="Answers, search, and your year" onPress={app.openHistory} />
          <Row title="Reminders" detail={state.reminderTime} onPress={() => app.setModal({ name: 'reminders' })} />
          <Row title="Edit names" detail="Yours and your partner’s" onPress={() => app.setModal({ name: 'edit' })} />
          <Row title="Privacy" detail="What stays on this phone" onPress={() => app.setModal({ name: 'privacy' })} />
          <Row title="More tools" detail="Reflections, focus, reset, and more" onPress={() => router.push('/more-tools')} />
        </View>
      </ScrollView>
    </TabScreen>
  );
}

function Row({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) {
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
  content: { paddingHorizontal: 22, paddingBottom: 32 },
  kicker: { marginTop: 18, color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  card: { marginTop: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 20, alignItems: 'center' },
  couple: { flexDirection: 'row' },
  big: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  overlap: { marginLeft: -12, borderWidth: 3, borderColor: '#fff' },
  letter: { fontFamily: serif, fontSize: 28, color: colors.ink },
  names: { fontFamily: serif, fontSize: 28, color: colors.ink, marginTop: 8 },
  meta: { color: colors.muted, marginTop: 4 },
  group: { marginTop: 22, marginBottom: 8, color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
  list: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 16, overflow: 'hidden' },
  row: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: '#fff' },
  rowTitle: { fontSize: 16, color: colors.ink },
  rowDetail: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
