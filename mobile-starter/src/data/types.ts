export type TabId = 'today' | 'todo' | 'features' | 'memories' | 'us';

export type IconName =
  | 'sun'
  | 'memories'
  | 'us'
  | 'arrow'
  | 'chevron'
  | 'clock'
  | 'spark'
  | 'check'
  | 'lock'
  | 'heart'
  | 'leaf'
  | 'close'
  | 'question'
  | 'choice'
  | 'action'
  | 'book';

export type MomentType = 'Appreciation' | 'Question' | 'Choice' | 'Action' | 'Check-in';

export type CatalogItem = {
  type: MomentType;
  icon: IconName;
  title: string;
  prompt: string;
  note: string;
  hint?: string;
  partner: string;
  sample: string;
  options?: string[];
};

export type HistoryItem = {
  date: string;
  index: number;
  me: string;
  partner: string;
};

export type TaskOwner = 'me' | 'us';

export type Task = {
  id: string;
  title: string;
  note: string;
  owner: TaskOwner;
  due: string;
  done: boolean;
  suggestion?: string;
};

export type WellbeingShare = {
  mood: boolean;
  need: boolean;
  sleep: boolean;
  readiness: boolean;
};

export type Wellbeing = {
  mood: string;
  need: string;
  device: boolean;
  share: WellbeingShare;
};

export type DebriefAnswers = {
  highlight: string;
  unspoken: string;
  next: string;
  connected: string;
};

export type DebriefShare = {
  highlight: boolean;
  unspoken: boolean;
  next: boolean;
  connected: boolean;
};

export type Debrief = {
  id: string;
  date: string;
  title: string;
  answers: DebriefAnswers;
  share: DebriefShare;
};

export type ReflectionPartner = {
  loved: string[];
  better: string[];
  strong: string;
  care: string;
};

export type Reflection = {
  loved: string[];
  better: string[];
  strong: string;
  care: string;
  submitted: boolean;
  partnerDone: boolean;
  revealed: boolean;
  partner?: ReflectionPartner;
};

export type PausePlan = {
  need: string;
  when: string;
  note: string;
  done: boolean;
};

export type AppState = {
  version: 1;
  me: string;
  partner: string;
  tab: TabId;
  date: string;
  index: number;
  answer: string;
  draft: string;
  partnerDone: boolean;
  revealed: boolean;
  reminders: boolean;
  evening: boolean;
  wellbeingByDay: Record<string, Wellbeing>;
  debriefs: Debrief[];
  focus: string[];
  focusSetupSeen: boolean;
  todos: Task[];
  history: HistoryItem[];
  selectedFeatures: string[];
  reflections: Record<string, Reflection>;
  pausePlan: PausePlan | null;
};

export type FocusId = 'restart' | 'communication' | 'distance' | 'everyday';

export type FocusOption = {
  id: FocusId;
  icon: IconName;
  title: string;
  short: string;
  description: string;
  indexes: number[];
};

export type Suggestion = {
  key: string;
  title: string;
  owner: TaskOwner;
  note: string;
};

export type FeatureId =
  | 'reflection'
  | 'foundations'
  | 'pause'
  | 'wellbeing'
  | 'debrief'
  | 'support'
  | 'plan'
  | 'wearable';

export type FeatureItem = {
  id: FeatureId;
  icon: IconName;
  title: string;
  description: string;
};

export type ModalState =
  | { name: 'focus'; first: boolean }
  | { name: 'welcome' }
  | { name: 'tools' }
  | { name: 'moment' }
  | { name: 'partner-update' }
  | { name: 'edit' }
  | { name: 'pair' }
  | { name: 'paired' }
  | { name: 'privacy' }
  | { name: 'reset' }
  | { name: 'memory'; date: string }
  | { name: 'task'; id?: string; preset?: { title: string; owner: TaskOwner; note: string } }
  | { name: 'support' }
  | { name: 'foundations' }
  | { name: 'wellbeing' }
  | { name: 'partner-view' }
  | { name: 'wearable' }
  | { name: 'debrief'; id?: string }
  | { name: 'debrief-detail'; id: string; partner: boolean }
  | { name: 'weekly'; key?: string }
  | { name: 'pause' }
  | { name: 'pause-preview' };
