import {
  DEBRIEF_FIELDS,
  FEATURE_CATALOG,
  FOCUS_OPTIONS,
  FOUNDATIONS,
  SAMPLE_REFLECTION_PARTNER,
  TASK_IDEAS,
  WELLBEING_MOODS,
  catalog,
} from '@/data/catalog';
import type {
  AppState,
  Debrief,
  DebriefAnswers,
  DebriefShare,
  HistoryItem,
  PausePlan,
  Reflection,
  Suggestion,
  TabId,
  Task,
  TaskOwner,
  Wellbeing,
} from '@/data/types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TABS: TabId[] = ['today', 'todo', 'features', 'memories', 'us'];

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function shiftDay(key: string, n: number): string {
  const d = new Date(key + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function prettyDate(key: string, options: Intl.DateTimeFormatOptions): string {
  if (!DATE.test(key)) return '';
  return new Date(key + 'T12:00:00').toLocaleDateString('en-US', options);
}

export function blankWellbeing(): Wellbeing {
  return {
    mood: '',
    need: '',
    device: false,
    share: { mood: false, need: false, sleep: false, readiness: false },
  };
}

export function blankReflection(): Reflection {
  return {
    loved: ['', '', ''],
    better: ['', '', ''],
    strong: '',
    care: '',
    submitted: false,
    partnerDone: false,
    revealed: false,
  };
}

export function initialState(now = new Date()): AppState {
  const day = dateKey(now);
  return {
    version: 1,
    me: 'Alexa',
    partner: 'Jamie',
    tab: 'today',
    date: day,
    index: 0,
    answer: '',
    draft: '',
    partnerDone: false,
    revealed: false,
    reminders: false,
    evening: false,
    wellbeingByDay: {},
    debriefs: [],
    focus: [],
    focusSetupSeen: false,
    todos: [],
    history: Array.from({ length: 6 }, (_, i) => {
      const index = (i + 1) % catalog.length;
      const item = catalog[index];
      return { date: shiftDay(day, -i - 1), index, me: item.sample, partner: item.partner };
    }),
    selectedFeatures: [],
    reflections: {},
    pausePlan: null,
  };
}

export function validState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const s = value as AppState;
  return (
    s.version === 1 &&
    TABS.includes(s.tab) &&
    typeof s.date === 'string' &&
    DATE.test(s.date) &&
    Number.isInteger(s.index) &&
    s.index >= 0 &&
    s.index < catalog.length &&
    typeof s.me === 'string' &&
    typeof s.partner === 'string' &&
    typeof s.answer === 'string' &&
    typeof s.draft === 'string' &&
    Array.isArray(s.history) &&
    s.history.every(
      (r: HistoryItem) =>
        !!r &&
        typeof r.date === 'string' &&
        DATE.test(r.date) &&
        Number.isInteger(r.index) &&
        r.index >= 0 &&
        r.index < catalog.length &&
        typeof r.me === 'string' &&
        typeof r.partner === 'string',
    )
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function cleanWellbeingMap(value: unknown): Record<string, Wellbeing> {
  const record = asRecord(value);
  if (!record) return {};
  const next: Record<string, Wellbeing> = {};
  for (const [day, raw] of Object.entries(record)) {
    const item = asRecord(raw);
    if (!DATE.test(day) || !item || typeof item.mood !== 'string' || typeof item.need !== 'string') continue;
    const moodOk = item.mood === '' || (WELLBEING_MOODS as readonly string[]).includes(item.mood);
    const share = asRecord(item.share);
    if (!moodOk || !share) continue;
    next[day] = {
      mood: item.mood,
      need: item.need,
      device: !!item.device,
      share: {
        mood: !!share.mood,
        need: !!share.need,
        sleep: !!share.sleep,
        readiness: !!share.readiness,
      },
    };
  }
  return next;
}

function cleanDebriefs(value: unknown): Debrief[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Debrief => {
    const d = asRecord(item);
    return !!d && typeof d.id === 'string' && typeof d.title === 'string' && typeof d.date === 'string' && !!asRecord(d.answers) && !!asRecord(d.share);
  }).map((item) => {
    const answers = item.answers;
    const share = item.share;
    return {
      id: item.id,
      date: item.date,
      title: item.title,
      answers: {
        highlight: String(answers.highlight ?? ''),
        unspoken: String(answers.unspoken ?? ''),
        next: String(answers.next ?? ''),
        connected: String(answers.connected ?? ''),
      },
      share: {
        highlight: !!share.highlight,
        unspoken: !!share.unspoken,
        next: !!share.next,
        connected: !!share.connected,
      },
    };
  });
}

function cleanReflection(value: unknown): Reflection | null {
  const r = asRecord(value);
  if (!r) return null;
  const loved = Array.isArray(r.loved) ? r.loved : [];
  const better = Array.isArray(r.better) ? r.better : [];
  const partner = asRecord(r.partner);
  return {
    loved: [0, 1, 2].map((i) => String(loved[i] ?? '').slice(0, 240)),
    better: [0, 1, 2].map((i) => String(better[i] ?? '').slice(0, 240)),
    strong: typeof r.strong === 'string' ? r.strong : '',
    care: typeof r.care === 'string' ? r.care : '',
    submitted: !!r.submitted,
    partnerDone: !!r.partnerDone,
    revealed: !!r.revealed,
    partner: partner
      ? {
          loved: Array.isArray(partner.loved) ? partner.loved.map(String) : [],
          better: Array.isArray(partner.better) ? partner.better.map(String) : [],
          strong: String(partner.strong ?? ''),
          care: String(partner.care ?? ''),
        }
      : undefined,
  };
}

function cleanPause(value: unknown): PausePlan | null {
  const p = asRecord(value);
  if (!p || typeof p.when !== 'string' || !p.when) return null;
  return {
    need: typeof p.need === 'string' ? p.need : PAUSE_FALLBACK,
    when: p.when.slice(0, 80),
    note: typeof p.note === 'string' ? p.note.slice(0, 300) : '',
    done: !!p.done,
  };
}

const PAUSE_FALLBACK = 'A little quiet to find my words';

export function normalizeState(raw: AppState): AppState {
  const base = initialState();
  const focus = [...new Set((Array.isArray(raw.focus) ? raw.focus : []).filter((id) => FOCUS_OPTIONS.some((f) => f.id === id)))];
  const todos = (Array.isArray(raw.todos) ? raw.todos : []).filter(
    (t): t is Task => !!t && typeof t.id === 'string' && typeof t.title === 'string' && (t.owner === 'me' || t.owner === 'us'),
  ).map((t) => ({
    id: t.id,
    title: t.title,
    note: typeof t.note === 'string' ? t.note : '',
    owner: t.owner,
    due: typeof t.due === 'string' ? t.due : '',
    done: !!t.done,
    suggestion: typeof t.suggestion === 'string' ? t.suggestion : undefined,
  }));
  const reflections: Record<string, Reflection> = {};
  const reflectionRecordRaw = asRecord(raw.reflections);
  if (reflectionRecordRaw) {
    for (const [key, value] of Object.entries(reflectionRecordRaw)) {
      if (!DATE.test(key)) continue;
      const cleaned = cleanReflection(value);
      if (cleaned) reflections[key] = cleaned;
    }
  }
  const selected = [...new Set((Array.isArray(raw.selectedFeatures) ? raw.selectedFeatures : []).filter((id) => FEATURE_CATALOG.some((f) => f.id === id)))];
  return {
    ...base,
    version: 1,
    me: raw.me,
    partner: raw.partner,
    tab: raw.tab,
    date: raw.date,
    index: raw.index,
    answer: raw.answer,
    draft: raw.draft,
    partnerDone: !!raw.partnerDone,
    revealed: !!raw.revealed,
    reminders: !!raw.reminders,
    evening: !!raw.evening,
    focusSetupSeen: !!raw.focusSetupSeen,
    history: raw.history,
    focus,
    todos,
    debriefs: cleanDebriefs(raw.debriefs),
    wellbeingByDay: cleanWellbeingMap(raw.wellbeingByDay),
    selectedFeatures: selected,
    reflections,
    pausePlan: cleanPause(raw.pausePlan),
  };
}

export function streak(state: AppState): number {
  const set = new Set(state.history.map((h) => h.date));
  let d = set.has(state.date) ? state.date : shiftDay(state.date, -1);
  let n = 0;
  while (set.has(d) && n < 10000) {
    n += 1;
    d = shiftDay(d, -1);
  }
  return n;
}

export function focusOptions(state: AppState) {
  const chosen = new Set(state.focus);
  return FOCUS_OPTIONS.filter((f) => chosen.has(f.id));
}

export function applyFocus(state: AppState, keys: string[]): AppState {
  const focus = [...new Set(keys.filter((k) => FOCUS_OPTIONS.some((f) => f.id === k)))];
  const next: AppState = { ...state, focus, focusSetupSeen: true };
  if (!state.answer && !state.draft.trim()) {
    next.index = focusOptions(next)[0]?.indexes[0] ?? 0;
  }
  return next;
}

export function nextMomentIndex(state: AppState): number {
  const options = focusOptions(state);
  if (!options.length) return (state.index + 1) % catalog.length;
  const pool = [...new Set(options.flatMap((f) => f.indexes))];
  const n = Math.floor(new Date(state.date + 'T12:00:00').getTime() / 86400000);
  const candidate = pool[n % pool.length];
  return candidate === state.index ? pool[(n + 1) % pool.length] : candidate;
}

export function submit(state: AppState): AppState {
  if (state.answer) return state;
  const item = catalog[state.index];
  const answer = item.type === 'Action' ? item.sample : state.draft.trim();
  if (!answer) return state;
  return { ...state, answer: answer.slice(0, 1200) };
}

export function partnerCompletes(state: AppState): AppState {
  if (!state.answer || state.partnerDone) return state;
  const history = state.history.some((r) => r.date === state.date)
    ? state.history
    : [{ date: state.date, index: state.index, me: state.answer, partner: catalog[state.index].partner }, ...state.history];
  return { ...state, partnerDone: true, history };
}

export function nextDay(state: AppState): AppState {
  if (!state.partnerDone) return state;
  const date = shiftDay(state.date, 1);
  const moved = { ...state, date };
  return {
    ...state,
    date,
    index: nextMomentIndex(moved),
    answer: '',
    draft: '',
    partnerDone: false,
    revealed: false,
    tab: 'today',
  };
}

export function suggestedTasks(state: AppState): Suggestion[] {
  const choices = focusOptions(state);
  const keys = choices.length ? choices.map((f) => f.id) : ['everyday'];
  const map = new Map<string, Suggestion>();
  for (const key of keys) {
    for (const idea of TASK_IDEAS[key] ?? []) {
      if (!map.has(idea[0])) map.set(idea[0], { key: idea[0], title: idea[1], owner: idea[2], note: idea[3] });
    }
  }
  return [...map.values()];
}

export function addSuggestion(state: AppState, key: string): AppState {
  const idea = suggestedTasks(state).find((item) => item.key === key);
  if (!idea || state.todos.some((t) => t.suggestion === key)) return state;
  return {
    ...state,
    todos: [...state.todos, { id: 'idea-' + key, title: idea.title, note: idea.note, owner: idea.owner, due: '', done: false, suggestion: key }],
  };
}

export function toggleTask(state: AppState, id: string): AppState {
  return { ...state, todos: state.todos.map((task) => (task.id === id ? { ...task, done: !task.done } : task)) };
}

export function createId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function saveTask(
  state: AppState,
  input: { id?: string; title: string; owner: string; due: string; note: string },
): { state: AppState; error?: string } {
  const title = input.title.trim().slice(0, 100);
  if (!title) return { state, error: 'Give your intention a little name.' };
  if (input.due && !DATE.test(input.due)) return { state, error: 'Choose a date or leave it blank.' };
  const prev = input.id ? state.todos.find((t) => t.id === input.id) : undefined;
  const task: Task = {
    id: prev?.id || createId('task'),
    title,
    owner: input.owner === 'me' ? 'me' : 'us',
    due: input.due,
    note: input.note.trim().slice(0, 500),
    done: prev?.done || false,
    suggestion: prev?.suggestion,
  };
  const todos = prev ? state.todos.map((t) => (t.id === prev.id ? task : t)) : [...state.todos, task];
  return { state: { ...state, todos, tab: 'todo' } };
}

export function chosenFeatures(state: AppState): string[] {
  return [...new Set(state.selectedFeatures.filter((id) => FEATURE_CATALOG.some((f) => f.id === id)))];
}

export function toggleFeature(state: AppState, id: string): { state: AppState; added: boolean } | null {
  if (!FEATURE_CATALOG.some((f) => f.id === id)) return null;
  const selected = chosenFeatures(state);
  const added = selected.includes(id);
  return {
    added,
    state: { ...state, selectedFeatures: added ? selected.filter((x) => x !== id) : [...selected, id] },
  };
}

export function wellbeingFor(state: AppState, date = state.date): Wellbeing {
  const w = state.wellbeingByDay[date];
  if (!w || typeof w.mood !== 'string' || typeof w.need !== 'string' || !w.share) return blankWellbeing();
  if (w.mood !== '' && !(WELLBEING_MOODS as readonly string[]).includes(w.mood)) return blankWellbeing();
  return {
    mood: w.mood,
    need: w.need,
    device: !!w.device,
    share: {
      mood: !!w.share.mood,
      need: !!w.share.need,
      sleep: !!w.share.sleep,
      readiness: !!w.share.readiness,
    },
  };
}

export function withWellbeing(state: AppState, date: string, wellbeing: Wellbeing): AppState {
  return { ...state, wellbeingByDay: { ...state.wellbeingByDay, [date]: wellbeing } };
}

export function sharedWellbeing(w: Wellbeing): [string, string][] {
  const list: [string, string][] = [];
  if (w.share.mood && w.mood) list.push(['Feeling', w.mood]);
  if (w.share.need && w.need.trim()) list.push(['What would help', w.need]);
  if (w.device && w.share.sleep) list.push(['Sleep · Oura sample', '6h 12m']);
  if (w.device && w.share.readiness) list.push(['Readiness · Oura sample', '68 / 100']);
  return list;
}

export function setDevice(draft: Wellbeing, on: boolean): Wellbeing {
  return {
    ...draft,
    device: on,
    share: on ? draft.share : { ...draft.share, sleep: false, readiness: false },
  };
}

export function sharedDebrief(d: Debrief): [string, string][] {
  const list: [string, string][] = [];
  for (const [key, label] of DEBRIEF_FIELDS) {
    if (d.share[key] && d.answers[key]?.trim()) list.push([label, d.answers[key]]);
  }
  if (d.share.connected && d.answers.connected) list.splice(1, 0, ['How connected I felt', d.answers.connected + ' out of 5']);
  return list;
}

export function debriefFields(d: Debrief, partner: boolean): { label: string; value: string; shared?: boolean }[] {
  if (partner) return sharedDebrief(d).map(([label, value]) => ({ label, value }));
  const fields = DEBRIEF_FIELDS.filter(([key]) => d.answers[key]).map(([key, label]) => ({
    label,
    value: d.answers[key],
    shared: d.share[key],
  }));
  if (d.answers.connected) {
    fields.splice(1, 0, { label: 'How connected I felt', value: d.answers.connected + ' out of 5', shared: d.share.connected });
  }
  return fields;
}

export function saveDebrief(
  state: AppState,
  input: { id?: string; title: string; answers: DebriefAnswers; share: DebriefShare },
): { state: AppState; id?: string; error?: string } {
  if (!Object.values(input.answers).some(Boolean)) {
    return { state, error: 'Add one little reflection or choose how connected you felt.' };
  }
  const previous = input.id ? state.debriefs.find((d) => d.id === input.id) : undefined;
  const debrief: Debrief = {
    id: previous?.id || createId('debrief'),
    date: previous?.date || state.date,
    title: input.title.trim().slice(0, 60) || 'Time together',
    answers: {
      highlight: input.answers.highlight.trim().slice(0, 600),
      unspoken: input.answers.unspoken.trim().slice(0, 600),
      next: input.answers.next.trim().slice(0, 600),
      connected: input.answers.connected,
    },
    share: input.share,
  };
  const debriefs = previous ? state.debriefs.map((d) => (d.id === previous.id ? debrief : d)) : [...state.debriefs, debrief];
  return { state: { ...state, debriefs }, id: debrief.id };
}

export function saveSupportNeed(state: AppState, need: string, when: string): AppState {
  const current = wellbeingFor(state);
  const text = need + (when.trim() ? ' Let’s reconnect ' + when.trim() + '.' : '');
  return withWellbeing(state, state.date, { ...current, need: text, share: { ...current.share, need: false } });
}

export function weekKey(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return shiftDay(date, -d.getDay());
}

export function isSunday(date: string): boolean {
  return new Date(date + 'T12:00:00').getDay() === 0;
}

export function showSundayCard(date: string, preview: boolean): boolean {
  return preview || isSunday(date);
}

export function reflectionRecord(state: AppState, key = weekKey(state.date)): Reflection {
  return state.reflections[key] ?? blankReflection();
}

export function writeReflection(state: AppState, key: string, record: Reflection): AppState {
  return { ...state, reflections: { ...state.reflections, [key]: record } };
}

export function touchReflection(state: AppState, key = weekKey(state.date)): AppState {
  if (state.reflections[key]) return state;
  return writeReflection(state, key, blankReflection());
}

export function updateCurrentReflection(state: AppState, recipe: (record: Reflection) => Reflection): AppState {
  const key = weekKey(state.date);
  const current = reflectionRecord(state, key);
  if (current.submitted) return state;
  return writeReflection(state, key, recipe(current));
}

export function submitReflection(state: AppState): { state: AppState; error?: string } {
  const key = weekKey(state.date);
  const record = reflectionRecord(state, key);
  if (record.submitted) return { state };
  if (!record.loved.some((x) => x.trim()) || !record.better.some((x) => x.trim())) {
    return { state, error: 'Add at least one thought for each question, or come back later.' };
  }
  return { state: writeReflection(state, key, { ...record, submitted: true }) };
}

export function partnerReflection(state: AppState): AppState {
  const key = weekKey(state.date);
  const record = reflectionRecord(state, key);
  if (!record.submitted) return state;
  return writeReflection(state, key, { ...record, partnerDone: true });
}

export function revealReflection(state: AppState): AppState {
  const key = weekKey(state.date);
  const record = reflectionRecord(state, key);
  if (!record.submitted || !record.partnerDone) return state;
  return writeReflection(state, key, { ...record, revealed: true, partner: SAMPLE_REFLECTION_PARTNER });
}

export function revealedReflections(state: AppState): [string, Reflection][] {
  return Object.entries(state.reflections)
    .filter(([, record]) => record.revealed)
    .sort((a, b) => b[0].localeCompare(a[0]));
}

export function savePause(state: AppState, input: { need: string; when: string; note: string }): AppState | null {
  const when = input.when.trim().slice(0, 80);
  if (!when) return null;
  return {
    ...state,
    pausePlan: { need: input.need, when, note: input.note.trim().slice(0, 300), done: false },
  };
}

export function foundationCount(): number {
  return FOUNDATIONS.length;
}

export function taskOwnerLabel(owner: TaskOwner): string {
  return owner === 'me' ? 'For me' : 'For us';
}
