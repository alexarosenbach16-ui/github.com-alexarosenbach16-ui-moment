import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { historyLines, prettyDate } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

const KIND: Record<string, string> = {
  answer: 'Answer',
  checkin: 'Check-in',
  reflection: 'Reflection',
  debrief: 'Debrief',
};

export default function HistoryScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const state = app.state;
  const lines = state ? historyLines(state) : [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Settings" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.barTitle}>History</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}>
        <Text style={styles.lead}>Past answers and check-ins, newest first.</Text>
        {lines.length ? (
          <View style={styles.list}>
            {lines.map((line) => (
              <Pressable
                key={line.id}
                accessibilityRole="button"
                onPress={() => openLine(line)}
                style={styles.row}
              >
                <Text style={styles.date}>{prettyDate(line.date, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                <Text style={styles.kind}>{KIND[line.kind]}</Text>
                <Text style={styles.title}>{line.title}</Text>
                <Text style={styles.detail}>{line.detail}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>Answers and check-ins will show up here.</Text>
        )}
      </ScrollView>
    </View>
  );

  function openLine(line: (typeof lines)[number]) {
    if (line.memoryDate) app.setModal({ name: 'memory', date: line.memoryDate });
    else if (line.kind === 'answer') app.setModal({ name: 'moment' });
    else if (line.reflectionKey) app.openWeekly(line.reflectionKey);
    else if (line.debriefId) app.setModal({ name: 'debrief-detail', id: line.debriefId, partner: false });
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { minWidth: 64, minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  barTitle: { fontFamily: serif, fontSize: 20, color: colors.ink },
  content: { paddingHorizontal: 22, paddingTop: 18 },
  lead: { color: '#8d96aa', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  list: { gap: 10 },
  row: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14 },
  date: { color: '#9099ab', fontSize: 12, fontWeight: '600' },
  kind: { color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 6 },
  title: { fontFamily: serif, fontSize: 20, lineHeight: 26, color: colors.ink, marginTop: 4 },
  detail: { color: '#66718b', fontSize: 14, lineHeight: 20, marginTop: 4 },
  empty: { color: '#8d96aa', fontSize: 15, lineHeight: 22 },
});
