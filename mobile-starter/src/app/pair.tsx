import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PAIR_CODE, catalog } from '@/data/catalog';
import { PrimaryButton, TextField } from '@/components/ui';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function PairScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const partner = app.state?.partner ?? 'Ben';
  const answer = app.state ? catalog[app.state.index].partner : '';

  const join = () => {
    if (code.trim().toUpperCase() !== PAIR_CODE) {
      setError('Try MOMENT.');
      return;
    }
    app.markPaired();
    setDone(true);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
      {done ? (
        <View style={{ gap: 12, marginTop: 24 }}>
          <Text style={styles.title}>Paired with {partner}</Text>
          <Text style={styles.copy}>Their answer is saved. Yours unlocks the reveal.</Text>
          <View style={styles.answer}><Text style={styles.answerText}>{answer}</Text></View>
          <PrimaryButton label="Back to today" onPress={() => router.replace('/')} />
        </View>
      ) : (
        <View style={{ gap: 12, marginTop: 24 }}>
          <Text style={styles.title}>Enter {partner}’s code</Text>
          <TextField value={code} autoCapitalize="characters" maxLength={12} placeholder="MOMENT" onChangeText={setCode} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Pair" onPress={join} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22 },
  back: { color: colors.primary, fontWeight: '700', fontSize: 16, paddingVertical: 12 },
  title: { fontFamily: serif, fontSize: 34, lineHeight: 40, color: colors.ink },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  answer: { backgroundColor: colors.lavender, borderRadius: 16, padding: 16 },
  answerText: { fontFamily: serif, fontSize: 20, lineHeight: 26, color: colors.ink },
  error: { color: colors.danger },
});
