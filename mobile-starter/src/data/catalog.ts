import type { CatalogItem, DebriefAnswers, FeatureItem, FocusOption, IconName, TabId, TaskOwner } from '@/data/types';

export const catalog: CatalogItem[] = [
  {
    type: 'Appreciation',
    icon: 'spark',
    title: 'The little things',
    prompt: 'What’s one little thing they do that means more than they know?',
    note: 'The everyday things are often the things that matter most.',
    hint: 'Something only you would notice…',
    partner: 'The way you always ask how my day really went. Even on the busy days, you make me feel like I matter.',
    sample: 'You remember the little things I mention, even when I’ve forgotten them myself.',
  },
  {
    type: 'Question',
    icon: 'question',
    title: 'Our kind of happy',
    prompt: 'If we could press pause on everything for an afternoon, what would we do?',
    note: 'No schedules. No to-do lists. Just a little time for the two of you.',
    hint: 'My perfect afternoon with you would be…',
    partner: 'A long walk somewhere quiet, picking up our favorite snacks, and coming home with absolutely no plans.',
    sample: 'A slow afternoon by the water, a coffee, and nowhere we need to be.',
  },
  {
    type: 'Choice',
    icon: 'choice',
    title: 'Same page, different plans',
    prompt: 'We have a free evening. What sounds most like us?',
    note: 'Pick your favorite. You’ll find out whether you’re dreaming of the same thing.',
    options: ['A cozy night in', 'A spontaneous little adventure', 'Dinner somewhere new', 'A sunset walk'],
    partner: 'A cozy night in',
    sample: 'A sunset walk',
  },
  {
    type: 'Action',
    icon: 'action',
    title: 'A little extra love',
    prompt: 'Leave your partner a little note somewhere they’ll find it.',
    note: 'One sentence is enough. Tell them something you’re glad you get to share with them.',
    partner: 'Done — a little note, just for you.',
    sample: 'Done — a little note, just for you.',
  },
  {
    type: 'Check-in',
    icon: 'sun',
    title: 'A little closer',
    prompt: 'How connected are you feeling today?',
    note: 'There’s no right answer. This is a small chance to understand each other.',
    partner: '4 out of 5',
    sample: '4 out of 5',
  },
  {
    type: 'Question',
    icon: 'leaf',
    title: 'A fresh start',
    prompt: 'What’s one small thing that would help us feel like a team again?',
    note: 'Start with something kind, specific, and possible. You don’t have to solve everything today.',
    hint: 'One small step that would help me is…',
    partner: 'A little time to listen to each other without trying to solve everything at once.',
    sample: 'A calm check-in where we both get a chance to finish our thoughts.',
  },
  {
    type: 'Question',
    icon: 'question',
    title: 'Feeling understood',
    prompt: 'When words are hard, what helps you feel heard?',
    note: 'You can need time, reassurance, or a quieter way to say it. Let each other know.',
    hint: 'It helps me when…',
    partner: 'A little patience, a softer tone, and knowing we can take a break and come back.',
    sample: 'Knowing I can pause to find my words without feeling rushed.',
  },
  {
    type: 'Choice',
    icon: 'choice',
    title: 'Close from a distance',
    prompt: 'What little long-distance ritual would you love this week?',
    note: 'Choose a small way to feel included in each other’s ordinary days.',
    options: ['A good-morning voice note', 'A phone-free video dinner', 'A walk while we call', 'A shared movie night'],
    partner: 'A walk while we call',
    sample: 'A good-morning voice note',
  },
  {
    type: 'Appreciation',
    icon: 'spark',
    title: 'Our everyday us',
    prompt: 'What’s an ordinary moment with us you’d like more of?',
    note: 'It doesn’t have to be a big date. Sometimes the smallest moments feel like home.',
    hint: 'I’d love more of…',
    partner: 'Making something simple for dinner together and catching up without our phones.',
    sample: 'A slow morning with coffee and no rush.',
  },
];

export const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: 'restart',
    icon: 'leaf',
    title: 'Rebuild & start fresh',
    short: 'Starting fresh',
    description: 'Find our way back, one small step at a time.',
    indexes: [5, 0, 3],
  },
  {
    id: 'communication',
    icon: 'question',
    title: 'Communicate better',
    short: 'Communication',
    description: 'Feel heard and make room for what we need.',
    indexes: [6, 4, 0],
  },
  {
    id: 'distance',
    icon: 'choice',
    title: 'Stay close, long distance',
    short: 'Long distance',
    description: 'Feel part of each other’s day, wherever we are.',
    indexes: [7, 1, 2],
  },
  {
    id: 'everyday',
    icon: 'sun',
    title: 'Connect in everyday life',
    short: 'Everyday connection',
    description: 'Keep making a little space for us.',
    indexes: [8, 0, 2, 3, 4],
  },
];

export const TASK_IDEAS: Record<string, [string, string, TaskOwner, string][]> = {
  restart: [
    ['fresh-checkin', 'Choose a calm time for a fresh-start conversation', 'us', 'A little time to listen. We don’t need to solve everything at once.'],
    ['fresh-intention', 'Write one small thing I want to do differently', 'me', 'Keep it kind, specific, and within my control.'],
  ],
  communication: [
    ['comm-pause', 'Agree on how we ask for a pause', 'us', 'Choose a gentle phrase and a time to come back to the conversation.'],
    ['comm-need', 'Name one thing that helps me feel heard', 'me', 'For example: a softer tone, a little patience, or reassurance.'],
  ],
  distance: [
    ['distance-call', 'Plan our next call', 'us', 'Choose a time that works for both of us.'],
    ['distance-ritual', 'Pick a little long-distance ritual', 'us', 'A voice note, a shared movie, or a walk while we call.'],
  ],
  everyday: [
    ['everyday-time', 'Make a little phone-free time together', 'us', 'A walk, coffee, or a quiet evening counts.'],
    ['everyday-thanks', 'Notice one thing I appreciate today', 'me', 'The small, ordinary things matter too.'],
  ],
};

export const FEATURE_CATALOG: FeatureItem[] = [
  { id: 'reflection', icon: 'heart', title: 'Our Sunday reflection', description: 'Notice the love. Make room for what could feel better.' },
  { id: 'foundations', icon: 'leaf', title: 'Our four foundations', description: 'Emotional safety, consideration, consistency, and repair.' },
  { id: 'pause', icon: 'clock', title: 'Pause & reconnect', description: 'Ask for space and choose a gentle time to talk again.' },
  { id: 'wellbeing', icon: 'sun', title: 'How I’m doing', description: 'Share a mood, a need, or a little context about your day.' },
  { id: 'debrief', icon: 'book', title: 'After time together', description: 'Reflect on a hangout. Keep it private or choose what to share.' },
  { id: 'support', icon: 'question', title: 'When words are hard', description: 'Find a gentle way to say what you need right now.' },
  { id: 'plan', icon: 'clock', title: 'Make time for us', description: 'Plan a call, a date, or a small moment together.' },
  { id: 'wearable', icon: 'leaf', title: 'Wearable preview', description: 'Try sample Oura readings with your own sharing choices.' },
];

export const FOUNDATIONS: [string, string][] = [
  ['Emotional safety', 'Room to share feelings, say no, and ask for space without fear.'],
  ['Consideration', 'Your feelings, needs, and time matter in my decisions.'],
  ['Consistency', 'Dependable care. Actions that match our words.'],
  ['Repair', 'Listen, take responsibility, and follow through after hurt.'],
];

export const WELLBEING_MOODS = ['Good', 'Okay', 'Low energy', 'Overwhelmed', 'Need quiet'] as const;

export const DEBRIEF_FIELDS: [Exclude<keyof DebriefAnswers, 'connected'>, string, string][] = [
  ['highlight', 'What was your favorite part?', 'A little moment you’d like to remember…'],
  ['unspoken', 'Anything still on your mind?', 'Something I didn’t quite get to say…'],
  ['next', 'What would you love to do next time?', 'A small idea for our next hangout…'],
];

export const CONNECTION_LABELS = ['A little distant', 'Somewhat distant', 'Somewhere in the middle', 'Connected', 'Really connected'];

export const SUPPORT_NEEDS = [
  'A little reassurance that we’re okay.',
  'A pause to find my words.',
  'Someone to listen without fixing it.',
  'A softer, slower conversation.',
  'A little closeness and time together.',
];

export const PAUSE_NEEDS = [
  'A little quiet to find my words',
  'A slower, softer conversation',
  'Time to settle before we continue',
];

export const SAMPLE_REFLECTION_PARTNER = {
  loved: ['You checked in before my busy day.', 'You listened without rushing me.', 'You made time for our call.'],
  better: ['Ask before making plans for us.', 'Let me know if you’ll be late.', 'Choose a calm time for hard conversations.'],
  strong: 'Consideration',
  care: 'Consistency',
};

export const SAMPLE_PARTNER_UPDATE = {
  summary: 'A little tired. A quiet evening would feel good.',
  feeling: 'A little tired today.',
  help: 'A quiet evening and a little reassurance.',
};

export const PAIR_CODE = 'MOMENT';

export const TABS: { id: TabId; icon: IconName; label: string }[] = [
  { id: 'today', icon: 'sun', label: 'Today' },
  { id: 'us', icon: 'us', label: 'Us' },
];
