import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ONBOARDING_QUESTIONS } from '@/data/catalog';
import { PrimaryButton, TextField } from '@/components/ui';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

const TIMES = [
  { label: 'Morning', value: '08:00' },
  { label: 'Afternoon', value: '13:00' },
  { label: 'Evening', value: '20:00' },
];

export default function OnboardingScreen() {
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [name, setName] = useState(app.state?.me ?? '');
  const questions = ONBOARDING_QUESTIONS.length;
  const reminderStep = questions + 1;
  const nameStep = questions + 2;
  const time = app.state?.reminderTime ?? '20:00';

  const skip = () => {
    app.finishOnboarding({ tags });
    router.replace('/');
    app.setModal({ name: 'moment' });
  };

  const choose = (id: string) => {
    const next = [...tags];
    next[step - 1] = id;
    setTags(next);
    setStep((value) => value + 1);
  };

  const finish = () => {
    app.finishOnboarding({ tags, name });
    router.replace('/invite');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <Pressable accessibilityRole="button" onPress={skip} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable>
      {step === 0 ? (
        <View style={styles.body}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.copy}>Three small things, once a day. About a minute each.</Text>
          <PrimaryButton label="Get started" onPress={() => setStep(1)} />
        </View>
      ) : null}
      {step > 0 && step <= questions ? (
        <View style={styles.body}>
          <Text style={styles.count}>{step} of {questions}</Text>
          <Text style={styles.title}>{ONBOARDING_QUESTIONS[step - 1].prompt}</Text>
          <View style={{ gap: 10 }}>
            {ONBOARDING_QUESTIONS[step - 1].options.map((option) => (
              <Pressable key={option.id} accessibilityRole="button" onPress={() => choose(option.id)} style={styles.option}>
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {step === reminderStep ? (
        <View style={styles.body}>
          <Text style={styles.title}>When should we nudge you?</Text>
          <Text style={styles.copy}>Saved on this phone. You can change it later.</Text>
          <View style={styles.times}>
            {TIMES.map((item) => (
              <Pressable key={item.value} accessibilityRole="button" onPress={() => app.setReminderTime(item.value)} style={[styles.option, time === item.value && styles.optionOn]}>
                <Text style={styles.optionText}>{item.label}</Text>
                <Text style={styles.time}>{item.value}</Text>
              </Pressable>
            ))}
          </View>
          <DateTimePicker
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={clock(time)}
            onChange={(_event, date) => {
              if (!date) return;
              app.setReminderTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
            }}
          />
          <PrimaryButton label="Continue" onPress={() => setStep(nameStep)} />
        </View>
      ) : null}
      {step === nameStep ? (
        <View style={styles.body}>
          <Text style={styles.title}>What should we call you?</Text>
          <TextField value={name} maxLength={24} placeholder="Alexa" onChangeText={setName} />
          <View style={{ marginTop: 16 }}>
            <PrimaryButton label="Continue" onPress={finish} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function clock(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number(part) || 0);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22 },
  skip: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  skipText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  body: { flex: 1, justifyContent: 'center', gap: 16 },
  count: { color: colors.muted, fontWeight: '700' },
  title: { fontFamily: serif, fontSize: 36, lineHeight: 42, color: colors.ink },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  option: { minHeight: 64, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center' },
  optionOn: { backgroundColor: colors.lavender, borderColor: colors.lavender },
  optionText: { fontSize: 18, lineHeight: 24, color: colors.ink, fontWeight: '600' },
  times: { gap: 8 },
  time: { color: colors.muted, marginTop: 2 },
});
