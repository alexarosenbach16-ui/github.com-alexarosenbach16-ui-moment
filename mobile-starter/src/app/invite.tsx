import { useRouter } from 'expo-router';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { catalog } from '@/data/catalog';
import { inviteLink } from '@/data/logic';
import { PrimaryButton } from '@/components/ui';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function InviteScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const partner = app.state?.partner ?? 'Ben';
  const code = app.state?.inviteCode ?? '';
  const link = inviteLink(code);
  const prompt = app.state ? catalog[app.state.index].prompt : '';

  const share = () => {
    void Share.share({ message: `Join me on Moment.\n${link}\nPairing code: ${code}` });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>Back</Text></Pressable>
      <Text style={styles.title}>Invite {partner}</Text>
      <Text style={styles.copy}>{partner} answered today’s question. Pair to see it.</Text>
      <Text style={styles.prompt}>{prompt}</Text>
      <Text style={styles.linkLabel}>Your invite link</Text>
      <Text style={styles.link}>{link}</Text>
      <View style={styles.code}><Text style={styles.codeText}>{code}</Text></View>
      <Text style={styles.note}>On this phone, the sample code MOMENT still pairs you.</Text>
      <View style={{ gap: 10, marginTop: 16 }}>
        <PrimaryButton label={`Text ${partner}`} onPress={share} />
        <PrimaryButton label="Enter a code" onPress={() => router.push('/pair')} />
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.later}><Text style={styles.laterText}>Later</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22 },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  title: { fontFamily: serif, fontSize: 36, color: colors.ink, marginTop: 12 },
  copy: { color: colors.ink, fontSize: 16, lineHeight: 22, marginTop: 8 },
  prompt: { color: colors.muted, marginTop: 8 },
  linkLabel: { marginTop: 18, color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  link: { marginTop: 4, color: colors.ink, fontSize: 16 },
  note: { marginTop: 8, color: colors.muted, fontSize: 13, lineHeight: 18 },
  code: { marginTop: 12, backgroundColor: colors.lavender, borderRadius: 16, padding: 18, alignItems: 'center' },
  codeText: { fontFamily: serif, fontSize: 32, letterSpacing: 4, color: colors.ink },
  later: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  laterText: { color: colors.muted, fontWeight: '600' },
});
