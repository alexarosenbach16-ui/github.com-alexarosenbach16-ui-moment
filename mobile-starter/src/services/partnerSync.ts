import { SAMPLE_PARTNER_UPDATE, SAMPLE_REFLECTION_PARTNER, catalog } from '@/data/catalog';
import type { ReflectionPartner } from '@/data/types';

/**
 * Partner boundary.
 *
 * Pairing, partner replies, reminders, and wearable readings are local
 * samples, the same way the web demo works. Screens ask this module for
 * what the sample partner would say. A real sync implementation can
 * replace these reads later and keep answers hidden until both people
 * finish. No messages are sent from this app.
 */
export type PartnerSync = {
  replyForMoment(index: number): string;
  reflection(): ReflectionPartner;
  dailyUpdate(): { summary: string; feeling: string; help: string };
};

export const samplePartner: PartnerSync = {
  replyForMoment(index) {
    return catalog[index]?.partner ?? '';
  },
  reflection() {
    return SAMPLE_REFLECTION_PARTNER;
  },
  dailyUpdate() {
    return SAMPLE_PARTNER_UPDATE;
  },
};
