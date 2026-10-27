import { Image, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { colors, serif, shadow, type as textType } from '@/theme';
import type { IconName } from '@/data/types';
import { useApp } from '@/state/AppContext';

export const momentLogo = require('../../assets/moment-logo.png');

export function Header() {
  const { state, storageOk, goTab } = useApp();
  if (!state) return null;
  const me = state.me.trim().charAt(0).toUpperCase() || 'A';
  const partner = state.partner.trim().charAt(0).toUpperCase() || 'B';
  return (
    <View>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Moment home" onPress={() => goTab('today')}>
          <Image source={momentLogo} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Open your couple profile" onPress={() => goTab('us')} style={styles.avatars}>
          <View style={[styles.avatar, styles.avatarBlue]}>
            <Text style={styles.avatarText}>{me}</Text>
          </View>
          <View style={[styles.avatar, styles.avatarLilac, styles.avatarOverlap]}>
            <Text style={[styles.avatarText, { color: '#9683b9' }]}>{partner}</Text>
          </View>
        </Pressable>
      </View>
      {!storageOk ? (
        <Text style={styles.notice}>Phone storage is unavailable. The app still works, but changes won’t survive a restart.</Text>
      ) : null}
    </View>
  );
}

export function TabScreen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header />
      {children}
    </View>
  );
}

export function PageHeading({ kicker, title, accent, subtitle }: { kicker: string; title: string; accent: string; subtitle: string }) {
  return (
    <View style={styles.heading}>
      <View style={styles.headingRow}>
        <Text style={textType.kicker}>{kicker}</Text>
        <Text style={styles.badge}>Your shared space</Text>
      </View>
      <Text style={textType.h1}>
        {title}
        <Text style={styles.em}>{'\n'}{accent}</Text>
      </Text>
      <Text style={styles.intro}>{subtitle}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, icon = 'arrow' }: { label: string; onPress: () => void; disabled?: boolean; icon?: IconName | null }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primary, disabled && styles.disabled, pressed && !disabled && styles.primaryPressed]}>
      <Text style={styles.primaryText}>{label}</Text>
      {icon ? <Icon name={icon} size={16} color="#fff" /> : null}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: IconName }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}>
      <Text style={styles.secondaryText}>{label}</Text>
      {icon ? <Icon name={icon} size={16} color={colors.ink} /> : null}
    </Pressable>
  );
}

export function QuietButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.quiet}>
      <Text style={styles.quietText}>{label}</Text>
    </Pressable>
  );
}

export function TextField({ style, ...props }: TextInputProps) {
  return <TextInput placeholderTextColor={colors.placeholder} style={[styles.input, props.multiline && styles.area, style]} {...props} />;
}

export function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export function InsetNote({ children }: { children: string }) {
  return <Text style={styles.inset}>{children}</Text>;
}

export function ErrorText({ children }: { children: string }) {
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

export function ChoiceButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceOn]}>
      <View style={[styles.radio, selected && styles.radioOn]} />
      <Text style={styles.choiceText}>{label}</Text>
    </Pressable>
  );
}

export function IconBubble({ name, lilac = false }: { name: IconName; lilac?: boolean }) {
  return (
    <View style={[styles.bubble, lilac && styles.bubbleLilac]}>
      <Icon name={name} size={16} color={lilac ? '#a294bb' : '#91a0c2'} />
    </View>
  );
}

export function MiniAvatar({ letter, lilac = false }: { letter: string; lilac?: boolean }) {
  return (
    <View style={[styles.mini, lilac && styles.miniLilac]}>
      <Text style={[styles.miniText, lilac && { color: '#9683b9' }]}>{letter}</Text>
    </View>
  );
}

export function ToastBanner() {
  const { toast } = useApp();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.toast, { bottom: 76 + insets.bottom }]}>
      <Text style={styles.toastText}>{toast}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  demoBar: {
    minHeight: 32,
    backgroundColor: '#eeedf8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 8,
  },
  demoDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#8f94c8' },
  demoText: { color: '#637092', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, flex: 1 },
  demoLink: { color: '#637092', fontSize: 12, fontWeight: '600', paddingVertical: 8 },
  header: {
    minHeight: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  logo: { width: 118, height: 42 },
  avatars: { width: 62, height: 40, flexDirection: 'row' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  avatarBlue: { backgroundColor: '#e5edff' },
  avatarLilac: { backgroundColor: colors.lilac },
  avatarOverlap: { marginLeft: -10 },
  avatarText: { fontWeight: '600', color: '#7c8bb0', fontSize: 13 },
  notice: { backgroundColor: colors.noticeBg, color: colors.notice, marginHorizontal: 18, marginTop: 10, borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 18 },
  heading: { marginTop: 22, marginBottom: 8 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 },
  badge: { fontSize: 11, backgroundColor: colors.badgeBg, color: colors.badge, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, overflow: 'hidden' },
  em: { fontFamily: serif, color: colors.em, fontStyle: 'italic' },
  intro: { marginTop: 12, color: colors.muted, fontSize: 14, lineHeight: 22, maxWidth: 340 },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  disabled: { opacity: 0.45 },
  secondary: {
    borderWidth: 1,
    borderColor: '#dfe3ef',
    backgroundColor: colors.white,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryPressed: { backgroundColor: '#f6f5fc' },
  secondaryText: { color: colors.ink, fontSize: 14 },
  quiet: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  quietText: { color: colors.muted, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: '#e3e6ef',
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    minHeight: 48,
  },
  area: { minHeight: 110, textAlignVertical: 'top' },
  fieldLabel: { fontSize: 13, color: '#8790a6', marginBottom: 8, marginTop: 16 },
  inset: { backgroundColor: '#eeedf7', color: '#6d7590', fontSize: 13, lineHeight: 20, padding: 14, borderRadius: 12, marginTop: 14 },
  error: { color: colors.danger, fontSize: 13, marginTop: 8 },
  choice: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#e5e7f0',
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  choiceOn: { backgroundColor: '#eeedf9', borderColor: '#aaa5d5' },
  choiceText: { flex: 1, color: colors.ink, fontSize: 15 },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#c9cee0' },
  radioOn: { borderColor: '#9290bd', backgroundColor: '#9290bd' },
  bubble: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#edf2fd', alignItems: 'center', justifyContent: 'center' },
  bubbleLilac: { backgroundColor: '#f0ebfa' },
  mini: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.blueWash, alignItems: 'center', justifyContent: 'center' },
  miniLilac: { backgroundColor: colors.lilac },
  miniText: { fontWeight: '600', color: '#7c8bb0', fontSize: 13 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, ...shadow },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: '#4c5877',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  toastText: { color: '#fff', textAlign: 'center', fontSize: 13, lineHeight: 18 },
});
