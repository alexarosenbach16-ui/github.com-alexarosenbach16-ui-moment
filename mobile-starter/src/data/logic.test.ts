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
  streak,
  submit,
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
eq(streak(state), 6, 'sample couple starts with six completed days');
state = { ...state, draft: '   ' };
eq(submit(state).answer, '', 'empty answers cannot submit');
state = submit({ ...state, draft: 'A small, thoughtful thing.' });
eq(streak(state), 6, 'one partner cannot increment the shared streak');
eq(state.answer, 'A small, thoughtful thing.', 'answer saved');
state = partnerCompletes(state);
eq(streak(state), 7, 'both partners complete the day');
const count = state.history.length;
state = partnerCompletes(state);
state = submit(state);
eq(state.history.length, count, 'duplicate taps do not duplicate a memory');
eq(streak(state), 7, 'duplicate completion does not increment the streak');
const before = state.date;
state = nextDay(state);
eq(state.date, shiftDay(before, 1), 'next day advances');
eq(state.answer, '', 'next day clears the answer');
eq(state.partnerDone, false, 'next day clears partner');
eq(streak(state), 7, 'streak holds after rollover');
state = { ...state, date: shiftDay(state.date, 2), draft: 'After a missed day' };
state = partnerCompletes(submit(state));
eq(streak(state), 1, 'a missed day resets the next completed streak');

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
