import { useRouter, type Href } from 'expo-router';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState as AppLifecycle } from 'react-native';

import { catalog } from '@/data/catalog';
import {
  addSuggestion,
  applyFocus,
  initialState,
  nextDay,
  partnerCompletes,
  partnerReflection,
  revealReflection,
  saveDebrief,
  savePause,
  saveSupportNeed,
  saveTask,
  setCheckInMood,
  setDevice,
  submit,
  submitReflection,
  toggleFeature,
  toggleTask,
  touchReflection,
  updateCurrentReflection,
  wellbeingFor,
  withWellbeing,
} from '@/data/logic';
import type { AppState, DebriefAnswers, DebriefShare, ModalState, TabId, TaskOwner, Wellbeing } from '@/data/types';
import { tabHref } from '@/navigation';
import { loadState, saveState } from '@/services/storage';

type TaskInput = { id?: string; title: string; owner: string; due: string; note: string };
type DebriefInput = { id?: string; title: string; answers: DebriefAnswers; share: DebriefShare };

type AppApi = {
  ready: boolean;
  storageOk: boolean;
  state: AppState | null;
  modal: ModalState | null;
  toast: string | null;
  sundayPreview: boolean;
  todoFilter: 'all' | 'me' | 'us';
  wellbeingDraft: Wellbeing | null;
  setSundayPreview: (value: boolean) => void;
  setTodoFilter: (value: 'all' | 'me' | 'us') => void;
  setModal: (modal: ModalState | null) => void;
  closeModal: () => void;
  showToast: (message: string) => void;
  goTab: (tab: TabId) => void;
  setTabFromRoute: (tab: TabId) => void;
  setDraft: (value: string) => void;
  submitAnswer: () => void;
  partnerCompletes: () => void;
  revealMoment: () => void;
  nextDay: () => void;
  setMomentIndex: (index: number) => void;
  applyFocus: (keys: string[]) => void;
  skipFocus: () => void;
  saveNames: (me: string, partner: string) => string | null;
  toggleSetting: (field: 'reminders' | 'evening') => void;
  resetDemo: () => void;
  toggleFeature: (id: string) => void;
  saveTask: (input: TaskInput) => string | null;
  toggleTask: (id: string) => void;
  addSuggestion: (key: string) => void;
  openWellbeing: () => void;
  openWearable: (fresh?: boolean) => void;
  returnToWellbeing: () => void;
  updateDraft: (recipe: (draft: Wellbeing) => Wellbeing) => void;
  saveWellbeingDraft: () => void;
  makeWellbeingPrivate: () => void;
  toggleDevice: (on: boolean) => void;
  saveDebrief: (input: DebriefInput) => string | null;
  updateReflection: (recipe: (record: import('@/data/types').Reflection) => import('@/data/types').Reflection) => void;
  submitReflection: () => string | null;
  partnerReflection: () => void;
  revealReflection: () => void;
  savePause: (input: { need: string; when: string; note: string }) => boolean;
  markReconnected: () => void;
  saveSupport: (need: string, when: string) => void;
  openPlan: (preset?: { title: string; owner: TaskOwner; note: string }) => void;
  openWeekly: (key?: string) => void;
  openHistory: () => void;
  setTodayMood: (mood: string) => void;
};

const Ctx = createContext<AppApi | null>(null);

function cloneWellbeing(w: Wellbeing): Wellbeing {
  return { ...w, share: { ...w.share } };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sundayPreview, setSundayPreview] = useState(false);
  const [todoFilter, setTodoFilter] = useState<'all' | 'me' | 'us'>('all');
  const [wellbeingDraft, setWellbeingDraft] = useState<Wellbeing | null>(null);
  const hydrated = useRef(false);
  const booted = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    let cancelled = false;
    void loadState().then((result) => {
      if (cancelled) return;
      setState(result.state);
      setStorageOk(result.ok);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    void saveState(state).then((ok) => setStorageOk(ok));
  }, [state]);

  useEffect(() => {
    const sub = AppLifecycle.addEventListener('change', (status) => {
      if (status === 'active' || !latest.current || !hydrated.current) return;
      void saveState(latest.current).then((ok) => setStorageOk(ok));
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!ready || !state || booted.current) return;
    booted.current = true;
    if (state.tab !== 'today') router.replace(tabHref(state.tab));
    if (!state.focusSetupSeen) setModal({ name: 'focus', first: true });
  }, [ready, state, router]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const closeModal = () => setModal(null);

  const goTab = (tab: TabId) => {
    setState((prev) => (prev ? { ...prev, tab } : prev));
    router.navigate(tabHref(tab));
  };

  const setTabFromRoute = (tab: TabId) => {
    setState((prev) => (prev && prev.tab !== tab ? { ...prev, tab } : prev));
  };

  const setDraft = (value: string) => {
    setState((prev) => (prev ? { ...prev, draft: value.slice(0, 1200) } : prev));
  };

  const submitAnswer = () => {
    const current = latest.current;
    if (!current) return;
    const next = submit(current);
    if (next === current) return;
    setState(next);
    showToast('Your part is saved. A little moment, just for you two.');
  };

  const finishPartner = () => {
    const current = latest.current;
    if (!current) return;
    const next = partnerCompletes(current);
    if (next === current) return;
    setState(next);
    showToast('Demo: your partner finished. Your Moment is ready.');
  };

  const revealMoment = () => {
    setState((prev) => (prev ? { ...prev, revealed: true } : prev));
  };

  const advanceDay = () => {
    const current = latest.current;
    if (!current?.partnerDone) return;
    setState(nextDay(current));
    setModal(null);
    router.navigate('/');
    showToast('A new demo day. A new little Moment.');
  };

  const setMomentIndex = (index: number) => {
    const current = latest.current;
    if (!current || current.answer || !Number.isInteger(index) || index < 0 || index >= catalog.length) return;
    setState({ ...current, index, draft: '', tab: 'today' });
    router.navigate('/');
    showToast(catalog[index].type + ' Moment selected.');
  };

  const chooseFocus = (keys: string[]) => {
    const current = latest.current;
    if (!current) return;
    if (!keys.length) return;
    setState(applyFocus(current, keys));
    setModal(null);
    showToast('Our focus, updated. Your memories and progress are still here.');
  };

  const skipFocus = () => {
    setState((prev) => (prev ? { ...prev, focusSetupSeen: true } : prev));
    setModal(null);
  };

  const saveNames = (me: string, partner: string) => {
    const a = me.trim().slice(0, 24);
    const b = partner.trim().slice(0, 24);
    if (!a || !b) return 'Add both first names to continue.';
    setState((prev) => (prev ? { ...prev, me: a, partner: b } : prev));
    setModal(null);
    showToast('Your little corner, made yours.');
    return null;
  };

  const toggleSetting = (field: 'reminders' | 'evening') => {
    setState((prev) => (prev ? { ...prev, [field]: !prev[field] } : prev));
    showToast('Reminder preference preview updated. No notifications are sent.');
  };

  const resetDemo = () => {
    setState(initialState());
    setSundayPreview(false);
    setTodoFilter('all');
    setWellbeingDraft(null);
    setModal({ name: 'focus', first: true });
    router.navigate('/');
    showToast('Demo reset. A fresh little start.');
  };

  const toggleFeatureAction = (id: string) => {
    const current = latest.current;
    if (!current) return;
    const result = toggleFeature(current, id);
    if (!result) return;
    setState(result.state);
    showToast(result.added ? 'Removed from To Do. Your saved entries are still here.' : 'Added to your To Do.');
  };

  const saveTaskAction = (input: TaskInput) => {
    const current = latest.current;
    if (!current) return 'Give your intention a little name.';
    const result = saveTask(current, input);
    if (result.error) return result.error;
    setState(result.state);
    setTodoFilter('all');
    setModal(null);
    router.navigate('/');
    showToast('Saved to your list. Your shared streak is unchanged.');
    return null;
  };

  const toggleTaskAction = (id: string) => {
    const current = latest.current;
    if (!current) return;
    const task = current.todos.find((item) => item.id === id);
    if (!task) return;
    setState(toggleTask(current, id));
    showToast(task.done ? 'Back on your list.' : 'A little step, taken.');
  };

  const addSuggestionAction = (key: string) => {
    const current = latest.current;
    if (!current) return;
    const next = addSuggestion(current, key);
    if (next === current) return;
    setState(next);
    showToast('Added. You choose when to make time for it.');
  };

  const openWellbeing = () => {
    const current = latest.current;
    if (!current) return;
    setWellbeingDraft(cloneWellbeing(wellbeingFor(current)));
    setModal({ name: 'wellbeing' });
  };

  const openWearable = (fresh = false) => {
    const current = latest.current;
    if (!current) return;
    if (fresh) setWellbeingDraft(cloneWellbeing(wellbeingFor(current)));
    else setWellbeingDraft((draft) => draft ?? cloneWellbeing(wellbeingFor(current)));
    setModal({ name: 'wearable' });
  };

  const returnToWellbeing = () => setModal({ name: 'wellbeing' });

  const updateDraft = (recipe: (draft: Wellbeing) => Wellbeing) => {
    setWellbeingDraft((draft) => (draft ? recipe(draft) : draft));
  };

  const saveWellbeingDraft = () => {
    const current = latest.current;
    if (!current || !wellbeingDraft) return;
    const next = withWellbeing(current, current.date, cloneWellbeing(wellbeingDraft));
    setState(next);
    setModal(null);
    const shared = wellbeingDraft.share;
    const any = (shared.mood && wellbeingDraft.mood) || (shared.need && wellbeingDraft.need.trim()) || (wellbeingDraft.device && (shared.sleep || shared.readiness));
    showToast(any ? 'Saved. Only your selected items appear in the sharing preview.' : 'Saved privately. Your shared streak is unchanged.');
  };

  const makeWellbeingPrivate = () => {
    const current = latest.current;
    if (!current) return;
    const w = wellbeingFor(current);
    setState(withWellbeing(current, current.date, { ...w, share: { mood: false, need: false, sleep: false, readiness: false } }));
    setWellbeingDraft(null);
    setModal(null);
    showToast('All wellbeing items are private.');
  };

  const toggleDevice = (on: boolean) => {
    const current = latest.current;
    if (!current) return;
    setWellbeingDraft((draft) => setDevice(draft ?? cloneWellbeing(wellbeingFor(current)), on));
    setModal({ name: 'wellbeing' });
    showToast(on ? 'Oura sample added. Choose whether to share it.' : 'Sample readings removed.');
  };

  const saveDebriefAction = (input: DebriefInput) => {
    const current = latest.current;
    if (!current) return 'Add one little reflection or choose how connected you felt.';
    const result = saveDebrief(current, input);
    if (result.error || !result.id) return result.error ?? 'Add one little reflection or choose how connected you felt.';
    setState(result.state);
    setModal({ name: 'debrief-detail', id: result.id, partner: false });
    showToast('Reflection saved. Your daily Moment and streak are unchanged.');
    return null;
  };

  const updateReflection = (recipe: (record: import('@/data/types').Reflection) => import('@/data/types').Reflection) => {
    setState((prev) => (prev ? updateCurrentReflection(prev, recipe) : prev));
  };

  const submitReflectionAction = () => {
    const current = latest.current;
    if (!current) return 'Add at least one thought for each question, or come back later.';
    const result = submitReflection(current);
    if (result.error) return result.error;
    setState(result.state);
    return null;
  };

  const partnerReflectionAction = () => {
    const current = latest.current;
    if (!current) return;
    setState(partnerReflection(current));
  };

  const revealReflectionAction = () => {
    const current = latest.current;
    if (!current) return;
    setState(revealReflection(current));
  };

  const savePauseAction = (input: { need: string; when: string; note: string }) => {
    const current = latest.current;
    if (!current) return false;
    const next = savePause(current, input);
    if (!next) return false;
    setState(next);
    setModal({ name: 'pause-preview' });
    return true;
  };

  const markReconnected = () => {
    setState((prev) => (prev?.pausePlan ? { ...prev, pausePlan: { ...prev.pausePlan, done: true } } : prev));
    setModal(null);
    showToast('A little return to each other.');
  };

  const saveSupport = (need: string, when: string) => {
    const current = latest.current;
    if (!current) return;
    const next = saveSupportNeed(current, need, when);
    setState(next);
    setWellbeingDraft(cloneWellbeing(wellbeingFor(next)));
    setModal({ name: 'wellbeing' });
    showToast('Saved privately. Choose whether you’d like to share it.');
  };

  const openPlan = (preset?: { title: string; owner: TaskOwner; note: string }) => {
    setModal({
      name: 'task',
      preset: preset ?? { title: 'Make a little time for us', owner: 'us', note: 'A call, a date, a walk, or a quiet evening. Choose something that fits us.' },
    });
  };

  const openWeekly = (key?: string) => {
    if (!key) setState((prev) => (prev ? touchReflection(prev) : prev));
    setModal({ name: 'weekly', key });
  };

  const openHistory = () => {
    router.push('/history' as Href);
  };

  const setTodayMood = (mood: string) => {
    const current = latest.current;
    if (!current) return;
    const next = setCheckInMood(current, mood);
    if (next !== current) setState(next);
  };

  const api: AppApi = {
    ready,
    storageOk,
    state,
    modal,
    toast,
    sundayPreview,
    todoFilter,
    wellbeingDraft,
    setSundayPreview,
    setTodoFilter,
    setModal,
    closeModal,
    showToast,
    goTab,
    setTabFromRoute,
    setDraft,
    submitAnswer,
    partnerCompletes: finishPartner,
    revealMoment,
    nextDay: advanceDay,
    setMomentIndex,
    applyFocus: chooseFocus,
    skipFocus,
    saveNames,
    toggleSetting,
    resetDemo,
    toggleFeature: toggleFeatureAction,
    saveTask: saveTaskAction,
    toggleTask: toggleTaskAction,
    addSuggestion: addSuggestionAction,
    openWellbeing,
    openWearable,
    returnToWellbeing,
    updateDraft,
    saveWellbeingDraft,
    makeWellbeingPrivate,
    toggleDevice,
    saveDebrief: saveDebriefAction,
    updateReflection,
    submitReflection: submitReflectionAction,
    partnerReflection: partnerReflectionAction,
    revealReflection: revealReflectionAction,
    savePause: savePauseAction,
    markReconnected,
    saveSupport,
    openPlan,
    openWeekly,
    openHistory,
    setTodayMood,
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp(): AppApi {
  const value = useContext(Ctx);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
