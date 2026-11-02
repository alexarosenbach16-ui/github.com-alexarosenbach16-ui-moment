import { initialState } from '@/data/logic';
import { applyRemote, parseSnapshot, questionIndexFor, visiblePartnerAnswer, type RemoteSnapshot } from '@/data/remote';

function eq(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) throw new Error(`${message}\n  actual: ${String(actual)}\n  expected: ${String(expected)}`);
}

function ok(value: unknown, message: string) {
  if (!value) throw new Error(message);
}

const couple = '11111111-1111-4111-8111-111111111111';
const first = questionIndexFor(couple, '2026-10-27', 22);
eq(questionIndexFor(couple, '2026-10-27', 22), first, 'a couple and a date always pick the same question');
ok(first >= 0 && first < 22, 'the question index stays inside the catalog');
eq(questionIndexFor(couple, '2026-10-27', 0), 0, 'an empty catalog does not crash');

eq(visiblePartnerAnswer('', true, 'secret'), '', 'a partner answer stays hidden until you answer');
eq(visiblePartnerAnswer('mine', false, 'secret'), '', 'a partner answer stays hidden until they answer');
eq(visiblePartnerAnswer('mine', true, 'secret'), 'secret', 'both answers unlock the partner text');

const remote: RemoteSnapshot = {
  userId: 'user-1',
  coupleId: couple,
  inviteCode: 'AB12CD',
  paired: true,
  myName: 'Alexa',
  partnerName: 'Ben',
  day: '2026-10-27',
  questionIndex: 3,
  myAnswer: '',
  myAnsweredAt: 0,
  partnerAnswered: true,
  partnerAnswer: 'should-not-leak',
  history: [{ day: '2026-10-26', questionIndex: 1, mine: 'yesterday', partner: 'his' }],
  mood: 'Okay',
  moodShared: false,
  partnerMood: '',
  todos: [{ id: 'todo-1', title: 'A walk', note: '', owner: 'us', due: '2026-10-27', done: false }],
};
const hidden = applyRemote(initialState(new Date('2026-10-27T12:00:00')), remote);
eq(hidden.partnerLive, '', 'sync does not copy a sealed answer onto this phone');
eq(hidden.partnerAnswered, true, 'sync still knows the partner finished');
eq(hidden.partnerDone, false, 'the reveal stays shut until your answer is in');
eq(hidden.history.length, 1, 'shared history arrives with the sync');
eq(hidden.todos.length, 1, 'shared to-dos arrive with the sync');
eq(hidden.wellbeingByDay['2026-10-27'].share.mood, false, 'mood stays private unless shared');

const open = applyRemote(hidden, { ...remote, myAnswer: 'hi', partnerAnswered: true, partnerAnswer: 'hello' });
eq(open.partnerLive, 'hello', 'both answers open the partner text');
eq(open.partnerDone, true, 'both answers can be revealed');

eq(parseSnapshot(null), null, 'a bad payload is ignored');
const parsed = parseSnapshot({ user_id: 'user-1', partner_answered: true, partner_answer: 'nope', my_answer: '' });
ok(parsed, 'a small payload still parses');
eq(visiblePartnerAnswer(parsed?.myAnswer ?? '', parsed?.partnerAnswered ?? false, parsed?.partnerAnswer ?? ''), '', 'a parsed payload still hides the sealed answer');

console.log('PASS: remote sync rules');
