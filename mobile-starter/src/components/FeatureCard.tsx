import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { IconBubble } from '@/components/ui';
import { FEATURE_CATALOG } from '@/data/catalog';
import type { FeatureId, FeatureItem } from '@/data/types';
import { useApp } from '@/state/AppContext';
import { colors } from '@/theme';

export function useOpenFeature() {
  const app = useApp();
  return (id: FeatureId) => {
    if (id === 'reflection') app.openWeekly();
    else if (id === 'foundations') app.setModal({ name: 'foundations' });
    else if (id === 'pause') app.setModal({ name: 'pause' });
    else if (id === 'wellbeing') app.openWellbeing();
    else if (id === 'debrief') app.setModal({ name: 'debrief' });
    else if (id === 'support') app.setModal({ name: 'support' });
    else if (id === 'plan') app.openPlan();
    else app.openWearable(true);
  };
}

export function FeatureCard({ feature, added }: { feature: FeatureItem; added: boolean }) {
  const app = useApp();
  const open = useOpenFeature();
  return (
    <View style={[styles.card, added && styles.added]}>
      <Pressable accessibilityRole="button" onPress={() => open(feature.id)} style={styles.tile}>
        <IconBubble name={feature.icon} lilac={feature.id === 'debrief'} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{feature.title}</Text>
          <Text style={styles.desc}>{feature.description}</Text>
        </View>
        <Icon name="chevron" size={16} color="#b9b8ce" />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={added ? `Remove ${feature.title} from To Do` : `Add ${feature.title} to To Do`}
        accessibilityState={{ selected: added }}
        onPress={() => app.toggleFeature(feature.id)}
        style={styles.toggle}
      >
        <Text style={[styles.toggleText, added && styles.toggleOff]}>{added ? '− Remove from To Do' : '+ Add to To Do'}</Text>
      </Pressable>
    </View>
  );
}

export function featureById(id: string): FeatureItem | undefined {
  return FEATURE_CATALOG.find((feature) => feature.id === id);
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden' },
  added: { borderColor: '#c8c5e5' },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
  title: { fontSize: 16, color: colors.ink, fontWeight: '500' },
  desc: { fontSize: 13, lineHeight: 19, color: '#939bb0', marginTop: 4 },
  toggle: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f1fc', borderTopWidth: 1, borderTopColor: '#e9e6f3' },
  toggleText: { color: '#655d8a', fontWeight: '600', fontSize: 13 },
  toggleOff: { color: '#777b90' },
});
