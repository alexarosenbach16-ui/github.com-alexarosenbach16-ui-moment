import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, TextField } from '@/components/ui';
import { currentUserId, signIn, signUp } from '@/services/cloud';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export default function AuthScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'up' | 'in'>('up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.includes('@') || password.length < 6) {
      setError('Use an email and a password of at least 6 characters.');
      return;
    }
    if (mode === 'up' && !adult) {
      setError('Confirm that you are 18 or older.');
      return;
    }
    setBusy(true);
    if (mode === 'up') {
      const result = await signUp(email, password);
      setBusy(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.needsConfirm) {
        setError('Check your email to confirm, then sign in. Confirmation can be turned off in the Supabase dashboard.');
        setMode('in');
        return;
      }
    } else {
      const message = await signIn(email, password);
      setBusy(false);
      if (message) {
        setError(message);
        return;
      }
    }
    const id = await currentUserId();
    if (id) app.noteSignedIn(id);
    await app.refreshCloud();
    router.replace(mode === 'up' ? '/onboarding?step=name' : '/');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.title}>{mode === 'up' ? 'Create your account' : 'Welcome back'}</Text>
      <Text style={styles.copy}>Email and a password. One account for you, then you pair with your partner.</Text>
      <TextField value={email} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="Email" onChangeText={setEmail} />
      <TextField value={password} secureTextEntry placeholder="Password" onChangeText={setPassword} />
      {mode === 'up' ? (
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: adult }} onPress={() => setAdult((value) => !value)} style={styles.check}>
          <View style={[styles.box, adult && styles.boxOn]} />
          <Text style={styles.checkText}>I am 18 or older</Text>
        </Pressable>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label={busy ? 'One moment' : mode === 'up' ? 'Create account' : 'Sign in'} disabled={busy} onPress={() => { void submit(); }} />
      <Pressable accessibilityRole="button" onPress={() => { setMode(mode === 'up' ? 'in' : 'up'); setError(''); }} style={styles.switch}>
        <Text style={styles.switchText}>{mode === 'up' ? 'I already have an account' : 'Need an account?'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22, gap: 14, justifyContent: 'center' },
  title: { fontFamily: serif, fontSize: 36, lineHeight: 42, color: colors.ink },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  check: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff' },
  boxOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  checkText: { color: colors.ink, fontSize: 16 },
  error: { color: colors.danger },
  switch: { minHeight: 44, justifyContent: 'center' },
  switchText: { color: colors.primary, fontWeight: '700' },
});
