import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ToastBanner } from '@/components/ui';
import { colors, serif } from '@/theme';

export function ModalSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.fill}>
          <Pressable accessibilityLabel="Close dialog" style={styles.backdrop} onPress={onClose} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16), maxHeight: '90%' }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close dialog" onPress={onClose} style={styles.close}>
                <Icon name="close" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
              {children}
            </ScrollView>
          </View>
          <ToastBanner aboveSheet />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(56,65,92,0.35)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 4, backgroundColor: '#e1e3ee', marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  title: { flex: 1, fontFamily: serif, fontSize: 28, lineHeight: 34, color: colors.ink, fontWeight: '400' },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eeedf6', alignItems: 'center', justifyContent: 'center' },
  body: { paddingBottom: 12 },
});
