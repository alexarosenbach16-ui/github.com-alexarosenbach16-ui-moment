import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { SecondaryButton } from '@/components/ui';
import { prettyDate, suggestedTasks, taskOwnerLabel } from '@/data/logic';
import type { Task } from '@/data/types';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export function TaskList() {
  const app = useApp();
  const state = app.state;
  if (!state) return null;
  const tasks = state.todos.filter((task) => app.todoFilter === 'all' || task.owner === app.todoFilter);
  const open = tasks.filter((task) => !task.done);
  const completed = tasks.filter((task) => task.done);
  const ideas = suggestedTasks(state);

  return (
    <View>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>OUR TO-DOS</Text>
      </View>
      <Text style={styles.note}>Shared plans and personal notes. Add what helps, and leave the rest.</Text>
      <View style={styles.toolbar}>
        <View style={styles.filters}>
          {([['all', 'All'], ['me', 'For me'], ['us', 'For us']] as const).map(([key, label]) => (
            <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: app.todoFilter === key }} onPress={() => app.setTodoFilter(key)} style={[styles.chip, app.todoFilter === key && styles.chipOn]}>
              <Text style={[styles.chipText, app.todoFilter === key && styles.chipTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add a task" onPress={() => app.setModal({ name: 'task' })} style={styles.add}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>
      {open.length ? (
        <View style={{ gap: 10 }}>{open.map((task) => <TaskRow key={task.id} task={task} />)}</View>
      ) : (
        <View style={styles.empty}>
          <Icon name="leaf" size={26} color="#aca6c6" />
          <Text style={styles.emptyTitle}>{completed.length ? 'A little breathing room.' : 'A fresh page for us.'}</Text>
          <Text style={styles.emptyCopy}>{completed.length ? 'Nothing else on this list right now.' : 'Add a small intention, a plan, or something you’d like to work on together.'}</Text>
          <SecondaryButton label="Add something that matters" onPress={() => app.setModal({ name: 'task' })} />
        </View>
      )}
      {completed.length ? <Completed tasks={completed} /> : null}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>IDEAS FOR YOUR FOCUS</Text>
        <Pressable accessibilityRole="button" onPress={() => app.setModal({ name: 'focus', first: false })} style={styles.linkHit}>
          <Text style={styles.link}>Change focus</Text>
        </Pressable>
      </View>
      <Text style={styles.suggestionNote}>Suggestions only. Add one if it feels useful.</Text>
      {ideas.map((idea) => {
        const added = state.todos.some((task) => task.suggestion === idea.key);
        return (
          <View key={idea.key} style={styles.suggestion}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ideaKicker}>{idea.owner === 'me' ? 'FOR ME' : 'FOR US'}</Text>
              <Text style={styles.ideaTitle}>{idea.title}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={added ? `Added: ${idea.title}` : `Add: ${idea.title}`} disabled={added} onPress={() => app.addSuggestion(idea.key)} style={styles.plus}>
              {added ? <Icon name="check" size={16} color="#9690ba" /> : <Text style={styles.plusText}>+</Text>}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function TaskRow({ task }: { task: Task }) {
  const app = useApp();
  return (
    <View style={styles.task}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.done }} accessibilityLabel={`${task.done ? 'Reopen' : 'Complete'}: ${task.title}`} onPress={() => app.toggleTask(task.id)} style={styles.checkHit}>
        <View style={[styles.check, task.done && styles.checkOn]}>{task.done ? <Icon name="check" size={12} color="#9690ba" /> : null}</View>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => app.setModal({ name: 'task', id: task.id })} style={styles.taskCopy}>
        <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
        <Text style={styles.taskMeta}>{taskOwnerLabel(task.owner)}{task.due ? ` · ${prettyDate(task.due, { month: 'short', day: 'numeric' })}` : ''}</Text>
      </Pressable>
      <Icon name="chevron" size={14} color="#c5c8d6" />
    </View>
  );
}

function Completed({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 18 }}>
      <Pressable accessibilityRole="button" onPress={() => setOpen((value) => !value)} style={styles.linkHit}>
        <Text style={styles.completedLabel}>Completed · {tasks.length}</Text>
      </Pressable>
      {open ? <View style={{ gap: 10, marginTop: 10 }}>{tasks.map((task) => <TaskRow key={task.id} task={task} />)}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 8, gap: 8 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: '#8a94a9' },
  note: { color: '#8d96aa', fontSize: 14, lineHeight: 20, marginBottom: 4 },
  linkHit: { minHeight: 36, justifyContent: 'center' },
  link: { color: '#8a88ad', fontSize: 13, fontWeight: '600' },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 14, gap: 8 },
  filters: { flexDirection: 'row', gap: 6, flex: 1 },
  chip: { minHeight: 40, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.lavender },
  chipText: { color: '#959db1', fontSize: 13 },
  chipTextOn: { color: colors.ink, fontWeight: '600' },
  add: { backgroundColor: colors.primary, minHeight: 42, borderRadius: 24, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#dad9e9', backgroundColor: '#faf9fd', borderRadius: 19, padding: 28 },
  emptyTitle: { fontFamily: serif, fontSize: 26, color: colors.ink, marginTop: 12, textAlign: 'center' },
  emptyCopy: { color: '#9a9fb0', textAlign: 'center', marginVertical: 12, fontSize: 14, lineHeight: 20 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingRight: 12 },
  checkHit: { width: 48, height: 56, alignItems: 'center', justifyContent: 'center' },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#c5c8db', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.lavender, borderColor: '#bdb5d8' },
  taskCopy: { flex: 1, paddingVertical: 12 },
  taskTitle: { fontSize: 15, lineHeight: 21, color: colors.ink },
  taskDone: { textDecorationLine: 'line-through', color: '#9a9fb1' },
  taskMeta: { color: '#9aa1b1', fontSize: 12, marginTop: 4 },
  completedLabel: { color: '#939aad', fontSize: 13 },
  suggestionNote: { color: '#a0a5b7', fontSize: 13, marginBottom: 4 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  ideaKicker: { fontSize: 10, letterSpacing: 1.2, color: '#a19bb6' },
  ideaTitle: { fontFamily: serif, fontSize: 22, lineHeight: 28, color: colors.ink, marginTop: 4 },
  plus: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#e4e2ee', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  plusText: { fontSize: 22, color: '#a39abb' },
});
