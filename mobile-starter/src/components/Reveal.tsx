import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, serif } from '@/theme';

export function SealedCard({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.sealWrap}>
      <View style={styles.glow} />
      <View style={styles.sealBack} />
      <View style={styles.seal}>
        <View style={styles.lock}>
          <Icon name="lock" size={22} color={colors.primary} />
        </View>
        <Text style={styles.sealKicker}>SEALED</Text>
        <Text style={styles.sealTitle}>{title}</Text>
        <Text style={styles.sealDetail}>{detail}</Text>
      </View>
    </View>
  );
}

export function FlipAnswer({ label, text, lilac = false, delay = 0 }: { label: string; text: string; lilac?: boolean; delay?: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(progress, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, progress]);
  const rotateY = progress.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] });
  const scale = progress.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0.82, 1.06, 1] });
  return (
    <Animated.View style={[styles.card, lilac && styles.cardLilac, { opacity: progress, transform: [{ perspective: 900 }, { rotateY }, { scale }] }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardText}>{text}</Text>
    </Animated.View>
  );
}

export function HeartBurst({ extra = 0 }: { extra?: number }) {
  const floaters = useRef([0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    floaters.forEach((value) => value.setValue(0));
    const anim = Animated.stagger(
      60,
      floaters.map((value, index) => Animated.timing(value, { toValue: 1, duration: 980, delay: 160 + index * 30, useNativeDriver: true })),
    );
    anim.start();
    return () => anim.stop();
  }, [extra, floaters]);
  return (
    <View pointerEvents="none" style={styles.burst}>
      {floaters.map((value, index) => {
        const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [24, -70 - (index % 3) * 16] });
        const opacity = value.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });
        const scale = value.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.4, 1.15, 0.85] });
        return (
          <Animated.Text
            key={index}
            style={[styles.heart, { marginLeft: (index - 2.5) * 26, opacity, transform: [{ translateY }, { scale }] }]}
          >
            ♥
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sealWrap: { marginTop: 8, marginBottom: 8, minHeight: 168, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 220, height: 140, borderRadius: 70, backgroundColor: colors.lavender, opacity: 0.85 },
  sealBack: { position: 'absolute', top: 18, width: '86%', height: 120, borderRadius: 18, backgroundColor: colors.blue, transform: [{ rotate: '-4deg' }] },
  seal: { width: '100%', borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, padding: 20, alignItems: 'center' },
  lock: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  sealKicker: { marginTop: 10, fontSize: 11, letterSpacing: 1.4, fontWeight: '700', color: colors.primary },
  sealTitle: { fontFamily: serif, fontSize: 26, lineHeight: 32, color: colors.ink, textAlign: 'center', marginTop: 6 },
  sealDetail: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  card: { backgroundColor: colors.blue, borderRadius: 16, padding: 16, marginTop: 12 },
  cardLilac: { backgroundColor: colors.lavender },
  cardLabel: { fontSize: 11, letterSpacing: 0.6, color: colors.ink, fontWeight: '700', marginBottom: 6 },
  cardText: { fontFamily: serif, fontSize: 20, lineHeight: 26, color: colors.ink },
  burst: { height: 86, alignItems: 'center', justifyContent: 'flex-end' },
  heart: { position: 'absolute', bottom: 8, fontSize: 22, color: '#7d74b0' },
});
