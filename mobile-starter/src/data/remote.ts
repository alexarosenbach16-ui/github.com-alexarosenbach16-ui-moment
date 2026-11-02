import { blankWellbeing } from '@/data/logic';
import type { AppState, HistoryItem, Task } from '@/data/types';

/** Same steps as public.question_index in supabase/schema.sql. */
export function questionIndexFor(coupleId: string, day: string, total: number): number {
  if (total <= 0) return 0;
  const input = `${coupleId}|${day}`;
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(hash, 33) + input.charCodeAt(i)) >>> 0;
  }
  return hash % total;
}

/** Partner text is visible only after both people have answered. A timeout does not reveal it. */
export function visiblePartnerAnswer(myAnswer: string, partnerAnswered: boolean, partnerAnswer: string): string {
  if (!myAnswer.trim() || !partnerAnswered) return '';
  return partnerAnswer.trim();
}

export type RemoteTodo = {
  id: string;
  title: string;
  note: string;
  owner: 'me' | 'us';
  due: string;
  done: boolean;
};

export type RemoteHistory = {
  day: string;
  questionIndex: number;
  mine: string;
  partner: string;
};

export type RemoteSnapshot = {
  userId: string;
  coupleId: string;
  inviteCode: string;
  paired: boolean;
  myName: string;
  partnerName: string;
  day: string;
  questionIndex: number;
  myAnswer: string;
  myAnsweredAt: number;
  partnerAnswered: boolean;
  partnerAnswer: string;
  history: RemoteHistory[];
  mood: string;
  moodShared: boolean;
  partnerMood: string;
  todos: RemoteTodo[];
};

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parseSnapshot(value: unknown): RemoteSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const userId = text(raw.user_id);
  if (!userId) return null;
  const history = Array.isArray(raw.history)
    ? raw.history.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Record<string, unknown>;
        const day = text(row.day);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return [];
        const questionIndex = Number(row.question_index);
        return [{
          day,
          questionIndex: Number.isInteger(questionIndex) && questionIndex >= 0 ? questionIndex : 0,
          mine: text(row.mine).slice(0, 140),
          partner: text(row.partner).slice(0, 140),
        }];
      })
    : [];
  const todos = Array.isArray(raw.todos)
    ? raw.todos.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Record<string, unknown>;
        const id = text(row.id);
        const title = text(row.title).trim();
        if (!id || !title) return [];
        return [{
          id,
          title: title.slice(0, 80),
          note: text(row.note).slice(0, 240),
          owner: row.owner === 'us' ? 'us' as const : 'me' as const,
          due: /^\d{4}-\d{2}-\d{2}$/.test(text(row.due)) ? text(row.due) : '',
          done: row.done === true,
        }];
      })
    : [];
  const questionIndex = Number(raw.question_index);
  const answeredAt = Number(raw.my_answered_at);
  return {
    userId,
    coupleId: text(raw.couple_id),
    inviteCode: text(raw.invite_code).toUpperCase(),
    paired: raw.paired === true,
    myName: text(raw.my_name).slice(0, 24),
    partnerName: text(raw.partner_name).slice(0, 24),
    day: /^\d{4}-\d{2}-\d{2}$/.test(text(raw.day)) ? text(raw.day) : '',
    questionIndex: Number.isInteger(questionIndex) && questionIndex >= 0 ? questionIndex : 0,
    myAnswer: text(raw.my_answer).slice(0, 140),
    myAnsweredAt: Number.isFinite(answeredAt) ? answeredAt : 0,
    partnerAnswered: raw.partner_answered === true,
    partnerAnswer: text(raw.partner_answer).slice(0, 140),
    history,
    mood: text(raw.mood).slice(0, 40),
    moodShared: raw.mood_shared === true,
    partnerMood: text(raw.partner_mood).slice(0, 40),
    todos,
  };
}

export function applyRemote(state: AppState, remote: RemoteSnapshot): AppState {
  const day = remote.day || state.date;
  const live = visiblePartnerAnswer(remote.myAnswer, remote.partnerAnswered, remote.partnerAnswer);
  const both = Boolean(remote.myAnswer.trim() && live);
  const history: HistoryItem[] = remote.history.map((item) => ({
    date: item.day,
    index: item.questionIndex,
    me: item.mine,
    partner: item.partner,
    reactions: 0,
  }));
  const previous = state.wellbeingByDay[day] ?? blankWellbeing();
  const wellbeingByDay = {
    ...state.wellbeingByDay,
    [day]: {
      ...previous,
      mood: remote.mood,
      share: { ...previous.share, mood: remote.moodShared },
    },
  };
  const todos: Task[] = remote.todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    note: todo.note,
    owner: todo.owner,
    due: todo.due,
    done: todo.done,
  }));
  const sameDay = state.date === day && state.index === remote.questionIndex;
  return {
    ...state,
    userId: remote.userId,
    coupleId: remote.coupleId,
    inviteCode: remote.inviteCode || state.inviteCode,
    paired: remote.paired,
    pairedWithCode: remote.paired ? remote.inviteCode : '',
    me: remote.myName || state.me,
    partner: remote.paired ? remote.partnerName || 'your partner' : 'your partner',
    date: day,
    index: remote.questionIndex,
    answer: remote.myAnswer,
    answerSavedAt: remote.myAnswer ? remote.myAnsweredAt || state.answerSavedAt || Date.now() : 0,
    draft: sameDay ? state.draft : '',
    partnerAnswered: remote.partnerAnswered,
    partnerDone: both,
    partnerLive: live,
    partnerMood: remote.partnerMood,
    revealed: sameDay && both ? state.revealed : false,
    history,
    todos: remote.coupleId ? todos : state.todos,
    wellbeingByDay,
    onboardingSeen: state.onboardingSeen || Boolean(remote.myName.trim()),
  };
}

export function remoteUnchanged(before: AppState, after: AppState): boolean {
  return JSON.stringify({
    userId: before.userId,
    coupleId: before.coupleId,
    inviteCode: before.inviteCode,
    paired: before.paired,
    me: before.me,
    partner: before.partner,
    date: before.date,
    index: before.index,
    answer: before.answer,
    partnerAnswered: before.partnerAnswered,
    partnerDone: before.partnerDone,
    partnerLive: before.partnerLive,
    partnerMood: before.partnerMood,
    revealed: before.revealed,
    history: before.history,
    todos: before.todos,
    mood: before.wellbeingByDay[before.date]?.mood,
    shared: before.wellbeingByDay[before.date]?.share.mood,
  }) === JSON.stringify({
    userId: after.userId,
    coupleId: after.coupleId,
    inviteCode: after.inviteCode,
    paired: after.paired,
    me: after.me,
    partner: after.partner,
    date: after.date,
    index: after.index,
    answer: after.answer,
    partnerAnswered: after.partnerAnswered,
    partnerDone: after.partnerDone,
    partnerLive: after.partnerLive,
    partnerMood: after.partnerMood,
    revealed: after.revealed,
    history: after.history,
    todos: after.todos,
    mood: after.wellbeingByDay[after.date]?.mood,
    shared: after.wellbeingByDay[after.date]?.share.mood,
  });
}
