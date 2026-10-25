import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FeatureCard } from '@/components/FeatureCard';
import { PageHeading, TabScreen } from '@/components/ui';
import { FEATURE_CATALOG } from '@/data/catalog';
import { chosenFeatures } from '@/data/logic';
import { useApp } from '@/state/AppContext';
import { colors } from '@/theme';

export default function FeaturesScreen() {
  const app = useApp();
  const state = app.state;
  if (!app.ready || !state) return <View style={styles.fill} />;
  const selected = new Set(chosenFeatures(state));
  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeading kicker="OUR FEATURES" title="Make this" accent="your space." subtitle="Add the features you want to To Do. Remove them whenever you like." />
        <Text style={styles.note}>Tap a feature to try it, or add it to your list for easy access. Everything is optional.</Text>
        <View style={{ gap: 12, marginTop: 18 }}>
          {FEATURE_CATALOG.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} added={selected.has(feature.id)} />
          ))}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 22, paddingBottom: 40 },
  note: { backgroundColor: '#eeedf7', color: '#6d7590', fontSize: 14, lineHeight: 21, padding: 14, borderRadius: 12, marginTop: 18 },
});
