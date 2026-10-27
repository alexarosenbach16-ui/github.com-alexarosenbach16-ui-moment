import { FEATURE_CATALOG, FOUNDATIONS, catalog } from '@/data/catalog';
import {
  addSuggestion,
  applyFocus,
  initialState,
  nextDay,
  partnerCompletes,
  reflectionRecord,
  revealReflection,
  saveDebrief,
  saveTask,
  sharedDebrief,
  sharedWellbeing,
  shiftDay,
  pickQuestion,
  preferredDepth,
  releaseDay,
  repairDay,
  repairTarget,
  streak,
  streakInfo,
  submit,
  waitOver,
  historyLines,
  normalizeState,
  setCheckInMood,
  submitReflection,
  suggestedTasks,
  toggleTask,
  touchReflection,
  validState,
  weekKey,
  wellbeingFor,
  withWellbeing,
  writeReflection,
} from '@/data/logic';
import type { AppState, TabId, Wellbeing } from '@/data/types';

function eq(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\n  actual: ${String(actual)}\n  expected: ${String(expected)}`);
  }
}

function ok(value: unknown, message: string) {
  if (!value) throw new Error(message);
}

let state = initialState(new Date('2026-10-25T12:00:00'));
eq(streak(state), 0, 'a new couple starts with no shared days');
ok(state.history.every((item) => item.index !== state.index), 'sample history does not repeat today’s question');
for (const id of ['restart', 'communication', 'distance', 'everyday']) {
  const focused = applyFocus(state, [id]);
  ok(focused.history.every((item) => item.index !== focused.index), `${id} does not reuse today’s question in history`);
}
state = { ...state, draft: '   ' };
eq(submit(state).answer, '', 'empty answers cannot submit');
state = submit({ ...state, draft: 'A small, thoughtful thing.' });
eq(streak(state), 0, 'one partner cannot increment the shared streak');
eq(state.answer, 'A small, thoughtful thing.', 'answer saved');
state = partnerCompletes(state);
eq(streak(state), 1, 'both partners complete the day');
const count = state.history.length;
state = partnerCompletes(state);
state = submit(state);
eq(state.history.length, count, 'duplicate taps do not duplicate a memory');
eq(streak(state), 1, 'duplicate completion does not increment the streak');
const before = state.date;
state = nextDay(state);
eq(state.date, shiftDay(before, 1), 'next day advances');
eq(state.answer, '', 'next day clears the answer');
eq(state.partnerDone, false, 'next day clears partner');
eq(state.partnerAnswered, false, 'a new day waits for both answers again');
eq(streak(state), 1, 'streak holds after rollover');
state = { ...state, date: shiftDay(state.date, 2), draft: 'After a missed day' };
state = partnerCompletes(submit(state));
eq(streak(state), 1, 'a second miss in the same week is not forgiven');
eq(streakInfo(state).graceDate, null, 'an unbridged miss is not shown as grace');
const sunday = partnerCompletes(submit({ ...initialState(new Date('2026-10-25T12:00:00')), draft: 'Sunday together' }));
eq(streak(sunday), 1, 'both answers add today to the streak');
eq(streakInfo(sunday).graceDate, null, 'an unbroken streak has no grace day');
const kept = partnerCompletes(submit({
  ...sunday,
  date: '2026-10-27',
  answer: '',
  draft: 'After one missed day',
  partnerDone: false,
  revealed: false,
  partnerAnswered: false,
}));
eq(streak(kept), 2, 'one missed day in the week is forgiven');
eq(streakInfo(kept).graceDate, '2026-10-26', 'the forgiven day is the one we show');
const wiped = partnerCompletes(submit({
  ...kept,
  date: '2026-10-30',
  answer: '',
  draft: 'Second gap',
  partnerDone: false,
  revealed: false,
  partnerAnswered: false,
}));
eq(streak(wiped), 1, 'another miss in that week starts the streak over');
const graceDays = ['2026-10-25', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-03'];
const nextWeek = {
  ...initialState(new Date('2026-11-03T12:00:00')),
  date: '2026-11-03',
  history: graceDays.map((date) => ({ date, index: 0, me: 'a', partner: 'b' })),
};
eq(streak(nextWeek), graceDays.length, 'each week forgives its own missed day');
eq(streakInfo(nextWeek).graceDate, '2026-11-02', 'the latest grace day is the one on screen');
eq(initialState().partner, 'Ben', 'sample partner is Ben');
const unlocked = submit({ ...initialState(new Date('2026-10-25T12:00:00')), partnerAnswered: true, draft: 'I answered too' });
eq(unlocked.partnerDone, true, 'answering after Ben unlocks the day');
eq(streak(unlocked), 1, 'the shared streak counts that day');

let rotation = { ...initialState(), askedIndexes: [] as number[], onboardingTags: [] as string[], focus: [] as string[], index: 0 };
const picks: number[] = [];
for (let i = 0; i < catalog.length; i += 1) {
  const index = pickQuestion(rotation);
  ok(!picks.includes(index), 'no repeat before the bank is exhausted');
  picks.push(index);
  rotation = { ...rotation, index, askedIndexes: [...rotation.askedIndexes, index] };
}
eq(new Set(picks).size, catalog.length, 'rotation covers every question once');
const again = pickQuestion(rotation);
ok(again !== rotation.index, 'after the bank is used, the question just shown stays out');
eq(preferredDepth([0, 1]), 'deeper', 'two light questions lead to a deeper one');
const depths = picks.slice(0, 15).map((index) => catalog[index].depth);
let lightRun = 0;
let ratioOk = true;
for (const depth of depths) {
  if (depth === 'light') lightRun += 1;
  else {
    if (lightRun > 2) ratioOk = false;
    lightRun = 0;
  }
}
ok(ratioOk, 'deeper questions arrive about every third pick');
let weighted = { ...initialState(), askedIndexes: [] as number[], onboardingTags: ['distance'], focus: ['distance'], index: 0 };
const weightedPicks: number[] = [];
for (let i = 0; i < 3; i += 1) {
  const index = pickQuestion(weighted);
  weightedPicks.push(index);
  weighted = { ...weighted, index, askedIndexes: [...weighted.askedIndexes, index] };
}
ok(weightedPicks.every((index) => catalog[index].tags.includes('distance')), 'chosen tags are picked before the rest');

const savedAt = new Date('2026-10-25T12:00:00').getTime();
let waiting = submit({ ...initialState(new Date('2026-10-25T12:00:00')), draft: 'A short note', answerSavedAt: 0 });
waiting = { ...waiting, answerSavedAt: savedAt, waitHours: 24 };
ok(!waitOver(waiting, savedAt + 23 * 60 * 60 * 1000), 'the reveal can still wait inside 24 hours');
ok(waitOver(waiting, savedAt + 25 * 60 * 60 * 1000), 'after 24 hours the day can move on');
const beforeRelease = streak(waiting);
const released = releaseDay(waiting, savedAt + 25 * 60 * 60 * 1000);
eq(streak(released), beforeRelease, 'a saved solo answer does not change the shared streak');
eq(released.date, '2026-10-26', 'the next question opens after the wait');
ok(released.answer === '', 'the new day starts unanswered');

const repairBase = {
  ...initialState(new Date('2026-10-27T18:00:00')),
  date: '2026-10-27',
  history: initialState(new Date('2026-10-27T18:00:00')).history.filter((item) => item.date !== '2026-10-26'),
};
eq(repairTarget(repairBase, new Date('2026-10-27T18:00:00')), '2026-10-26', 'yesterday is open to repair within 48 hours');
const repaired = repairDay(repairBase, 'A kind note for yesterday', new Date('2026-10-27T18:00:00'));
ok(repaired.history.some((item) => item.date === '2026-10-26' && item.repaired), 'yesterday’s answer is saved');
ok(streak(repaired) > streak(repairBase), 'repairing yesterday keeps it in the streak');

state = initialState(new Date('2026-10-25T12:00:00'));
for (let i = 0; i < catalog.length; i += 1) {
  const item = catalog[i];
  ok(item.prompt.length > 0, 'prompt exists');
  if (item.type === 'Choice') eq(item.options?.length, 4, 'choice has four options');
  if (item.type === 'Action') {
    const acted = submit({ ...state, index: i, draft: '', answer: '' });
    ok(acted.answer.length > 0, 'action submits a sample');
  }
}
eq(validState({ version: 1 }), false, 'invalid saved data is rejected');
eq(validState(initialState()), true, 'initial state is valid');

state = initialState(new Date('2026-10-25T12:00:00'));
const originalStreak = streak(state);
let w: Wellbeing = wellbeingFor(state);
eq(sharedWellbeing(w).length, 0, 'wellbeing defaults private');
w = { ...w, mood: 'Overwhelmed', need: 'A quiet evening', device: true };
eq(sharedWellbeing(w).length, 0, 'adding readings does not automatically share them');
w = { ...w, share: { ...w.share, mood: true } };
eq(sharedWellbeing(w).length, 1, 'mood share');
eq(sharedWellbeing(w)[0][1], 'Overwhelmed', 'shared mood value');
w = { ...w, share: { ...w.share, sleep: true } };
eq(sharedWellbeing(w).length, 2, 'sleep share');
w = { ...w, device: false };
eq(sharedWellbeing(w).length, 1, 'removed device readings never appear in partner preview');
state = withWellbeing(state, state.date, { ...w, device: true, mood: 'Overwhelmed' });
const saved = saveDebrief(state, {
  title: 'A walk',
  answers: { highlight: 'The sunset', connected: '4', unspoken: 'A private thought', next: 'Coffee' },
  share: { highlight: true, connected: false, unspoken: false, next: false },
});
state = saved.state;
const debrief = state.debriefs[0];
eq(sharedDebrief(debrief).length, 1, 'one shared debrief field');
eq(sharedDebrief(debrief)[0][1], 'The sunset', 'shared highlight');
ok(!JSON.stringify(sharedDebrief(debrief)).includes('A private thought'), 'private thought stays out');
eq(streak(state), originalStreak, 'optional features do not affect streak');
const priorDate = state.date;
state = { ...state, date: shiftDay(state.date, 1) };
eq(wellbeingFor(state).mood, '', 'wellbeing starts fresh each demo day');
eq(sharedWellbeing(wellbeingFor(state)).length, 0, 'new day sharing is empty');
state = { ...state, date: priorDate };
eq(wellbeingFor(state).mood, 'Overwhelmed', 'previous day saved wellbeing is retained');

state = initialState(new Date('2026-10-25T12:00:00'));
const untouched = streak(state);
const oldMemories = state.history.length;
state = applyFocus(state, ['restart', 'communication', 'restart', 'invalid']);
eq(state.focus.length, 2, 'two focuses');
eq(state.index, 5, 'first focus prompt');
eq(state.focusSetupSeen, true, 'setup seen');
ok(suggestedTasks(state).some((t) => t.key === 'comm-pause'), 'communication suggestion');
state = addSuggestion(state, 'comm-pause');
state = addSuggestion(state, 'comm-pause');
eq(state.todos.length, 1, 'a suggestion is added only once');
eq(state.todos[0].owner, 'us', 'shared suggestion');
state = toggleTask(state, state.todos[0].id);
eq(state.todos[0].done, true, 'task completes');
eq(streak(state), untouched, 'tasks do not change streak');
state = toggleTask(state, state.todos[0].id);
eq(state.todos[0].done, false, 'task reopens');
state = { ...state, answer: 'Keep my response' };
const submittedIndex = state.index;
state = applyFocus(state, ['distance']);
eq(state.index, submittedIndex, 'focus changes preserve an in-progress Moment');
eq(state.answer, 'Keep my response', 'answer preserved');
eq(state.history.length, oldMemories, 'history preserved');
eq(state.todos.length, 1, 'todos preserved');
ok(suggestedTasks(state).some((t) => t.key === 'distance-call'), 'distance suggestion');
const savedTask = saveTask(state, { title: '  A gentle check-in  ', due: '', owner: 'me', note: 'When I feel ready' });
state = savedTask.state;
eq(state.todos.length, 2, 'task added');
eq(state.todos[1].title, 'A gentle check-in', 'title trimmed');
eq(state.todos[1].owner, 'me', 'personal task');
eq(state.tab, 'today', 'saving a task stays on Today');
eq(streak(state), untouched, 'adding a task does not change streak');
const legacyTodo = { ...initialState(), tab: 'todo' as TabId, answer: 'still here' };
ok(validState(legacyTodo), 'legacy todo tab still loads');
eq(normalizeState(legacyTodo).tab, 'today', 'a saved To Do tab opens on Today');
eq(normalizeState(legacyTodo).answer, 'still here', 'a legacy tab keeps saved answers');
eq(normalizeState({ ...initialState(), tab: 'features' as TabId }).tab, 'today', 'a saved Features tab opens on Today');
eq(normalizeState({ ...initialState(), tab: 'memories' as TabId }).tab, 'us', 'a saved Memories tab opens on Us');
eq(FEATURE_CATALOG.length, 8, 'eight optional features');
const checked = setCheckInMood(initialState(new Date('2026-10-25T12:00:00')), 'Okay');
eq(checked.wellbeingByDay[checked.date].mood, 'Okay', 'mood check-in is saved');
eq(checked.wellbeingByDay[checked.date].share.mood, false, 'mood check-in stays private');
const lines = historyLines(checked);
eq(lines[0].kind, 'checkin', 'newest check-in leads History');
ok(lines.slice(1).every((line) => line.kind === 'answer'), 'past answers follow the check-in');
ok(lines.every((line, index) => index === 0 || line.date <= lines[index - 1].date), 'history is in date order');

state = initialState(new Date('2026-10-25T12:00:00'));
state = { ...state, date: '2026-10-25' };
const weeklyStreak = streak(state);
const dailyCount = state.history.length;
eq(weekKey(state.date), '2026-10-25', 'sunday week key');
state = touchReflection(state);
let weekly = reflectionRecord(state);
weekly = { ...weekly, loved: ['A thoughtful walk', '', ''], better: ['More notice', '', ''] };
state = writeReflection(state, weekKey(state.date), weekly);
eq(reflectionRecord(state).loved[0], 'A thoughtful walk', 'private draft is retained');
ok(!state.reflections['2026-10-25'].revealed, 'unfinished reflections stay out of Memories');
state = submitReflection(state).state;
eq(state.reflections['2026-10-25'].submitted, true, 'reflection submitted');
state = revealReflection({ ...state, reflections: { ...state.reflections, '2026-10-25': { ...state.reflections['2026-10-25'], partnerDone: true } } });
eq(state.reflections['2026-10-25'].revealed, true, 'reflection revealed');
eq(streak(state), weeklyStreak, 'weekly flow never alters streak');
eq(state.history.length, dailyCount, 'weekly flow never alters daily history');
eq(new Date('2026-10-26T12:00:00').getDay() === 0, false, 'monday is not sunday');
state = { ...state, date: '2026-10-26' };
eq(reflectionRecord(state).loved[0], 'A thoughtful walk', 'same week keeps the draft');
state = { ...state, date: '2026-11-01' };
eq(reflectionRecord(state).submitted, false, 'next Sunday starts fresh');
state = touchReflection(state);
eq(Object.keys(state.reflections).length, 2, 'past reflection remains saved');
eq(FOUNDATIONS.length, 4, 'four foundations');

const typed: AppState = state;
ok(typed.version === 1, 'state still version 1');
console.log('PASS: moment mobile logic matches the demo rules.');
