import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ModalSheet } from '@/components/ModalSheet';
import { MomentFlow } from '@/components/MomentFlow';
import { ChoiceButton, ErrorText, FieldLabel, InsetNote, PrimaryButton, QuietButton, SecondaryButton, TextField } from '@/components/ui';
import {
  CONNECTION_LABELS,
  DEBRIEF_FIELDS,
  FOCUS_OPTIONS,
  FOUNDATIONS,
  PAIR_CODE,
  PAUSE_NEEDS,
  SAMPLE_PARTNER_UPDATE,
  SUPPORT_NEEDS,
  WELLBEING_MOODS,
  catalog,
} from '@/data/catalog';
import { dateKey, debriefFields, prettyDate, reflectionRecord, sharedWellbeing, weekKey } from '@/data/logic';
import type { Debrief, DebriefAnswers, DebriefShare, Wellbeing } from '@/data/types';
import { useApp } from '@/state/AppContext';
import { colors, serif } from '@/theme';

export function ModalHost() {
  const app = useApp();
  const modal = app.modal;
  const state = app.state;
  if (!modal || !state) return null;

  const custom = modal.name === 'memory' ? prettyDate(modal.date, { month: 'long', day: 'numeric' }) : modal.name === 'debrief-detail' ? state.debriefs.find((d) => d.id === modal.id)?.title : undefined;
  const title = modal.name === 'focus' && !modal.first ? 'What matters to us now?' : modal.name === 'task' && modal.id ? 'A little intention.' : modalTitle(modal.name, state.partner, custom);

  return (
    <ModalSheet title={title} onClose={app.closeModal}>
      {modal.name === 'focus' ? <FocusForm first={modal.first} /> : null}
      {modal.name === 'welcome' ? <Welcome /> : null}
      {modal.name === 'tools' ? <Tools /> : null}
      {modal.name === 'moment' ? <MomentFlow /> : null}
      {modal.name === 'partner-update' ? <PartnerUpdate /> : null}
      {modal.name === 'edit' ? <NamesForm /> : null}
      {modal.name === 'pair' ? <PairForm /> : null}
      {modal.name === 'paired' ? <Paired /> : null}
      {modal.name === 'privacy' ? <Privacy /> : null}
      {modal.name === 'reset' ? <Reset /> : null}
      {modal.name === 'memory' ? <Memory date={modal.date} /> : null}
      {modal.name === 'task' ? <TaskForm id={modal.id} preset={modal.preset} /> : null}
      {modal.name === 'support' ? <SupportForm /> : null}
      {modal.name === 'foundations' ? <Foundations /> : null}
      {modal.name === 'wellbeing' ? <WellbeingForm /> : null}
      {modal.name === 'partner-view' ? <PartnerPreview /> : null}
      {modal.name === 'wearable' ? <Wearable /> : null}
      {modal.name === 'debrief' ? <DebriefForm id={modal.id} /> : null}
      {modal.name === 'debrief-detail' ? <DebriefDetail id={modal.id} partner={modal.partner} /> : null}
      {modal.name === 'weekly' ? <Weekly keyName={modal.key} /> : null}
      {modal.name === 'pause' ? <PauseForm /> : null}
      {modal.name === 'pause-preview' ? <PausePreview /> : null}
    </ModalSheet>
  );
}

function modalTitle(name: string, partner: string, custom?: string): string {
  switch (name) {
    case 'focus':
      return 'What brings you here?';
    case 'welcome':
      return 'A little hello.';
    case 'tools':
      return 'Explore the demo';
    case 'moment':
      return 'Our daily Moment.';
    case 'partner-update':
      return `${partner}’s day.`;
    case 'edit':
      return 'The two of you.';
    case 'pair':
      return 'Better, together.';
    case 'paired':
      return 'You’re connected.';
    case 'privacy':
      return 'A note on privacy.';
    case 'reset':
      return 'A fresh little start?';
    case 'memory':
      return custom || 'A memory';
    case 'task':
      return 'What matters to you?';
    case 'support':
      return 'When words are hard.';
    case 'foundations':
      return 'Our four foundations.';
    case 'wellbeing':
      return 'How I’m doing today.';
    case 'partner-view':
      return 'Through their eyes.';
    case 'wearable':
      return 'A little more context.';
    case 'debrief':
      return 'After time together.';
    case 'debrief-detail':
      return custom || 'Time together';
    case 'weekly':
      return 'Our Sunday reflection.';
    case 'pause':
      return 'Pause & reconnect.';
    case 'pause-preview':
      return 'A little room to breathe.';
    default:
      return 'Moment';
  }
}

function FocusForm({ first }: { first: boolean }) {
  const app = useApp();
  const selected = new Set(app.state?.focus ?? []);
  const [keys, setKeys] = useState<string[]>([...selected]);
  const [error, setError] = useState('');
  const toggle = (id: string) => {
    setKeys((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setError('');
  };
  return (
    <View>
      <Text style={styles.copy}>Starting over, finding your words, or feeling close from far away. Choose what fits your relationship today.</Text>
      <View style={{ gap: 10, marginTop: 16 }}>
        {FOCUS_OPTIONS.map((focus) => {
          const on = keys.includes(focus.id);
          return (
            <Pressable key={focus.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggle(focus.id)} style={[styles.focus, on && styles.focusOn]}>
              <View style={styles.focusIcon}>
                <Icon name={focus.icon} size={18} color="#aaa2c2" />
              </View>
              <View style={{ flex: 1, paddingRight: 28 }}>
                <Text style={styles.focusTitle}>{focus.title}</Text>
                <Text style={styles.focusDesc}>{focus.description}</Text>
              </View>
              <View style={[styles.box, styles.focusBox, on && styles.boxOn]}>{on ? <Icon name="check" size={12} color="#fff" /> : null}</View>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>Choose more than one. You can change these anytime in Us.</Text>
      <ErrorText>{error}</ErrorText>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          label={first ? 'Make this our space' : 'Save our focus'}
          onPress={() => {
            if (!keys.length) {
              setError('Choose at least one, or choose later.');
              return;
            }
            app.applyFocus(keys);
          }}
        />
      </View>
      {first ? <QuietButton label="Choose later" onPress={app.skipFocus} /> : null}
    </View>
  );
}

function Welcome() {
  const app = useApp();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.welcomeTitle}>A little space.{'\n'}For your kind of us.</Text>
      <Text style={styles.copyCenter}>Start fresh, communicate, or stay close from miles apart. Find what helps you two.</Text>
      <View style={{ alignSelf: 'stretch', gap: 10 }}>
        <PrimaryButton label="Choose what brings us here" onPress={() => app.setModal({ name: 'focus', first: !app.state?.focusSetupSeen })} />
        <SecondaryButton label="I have a partner code" onPress={() => app.setModal({ name: 'pair' })} />
        <QuietButton label="Explore with the sample couple" onPress={app.closeModal} />
      </View>
      <Text style={styles.kicker}>A FIRST LOOK AT MOMENT</Text>
      <Text style={styles.fine}>Demo only. No sign-up required.</Text>
    </View>
  );
}

function Tools() {
  const app = useApp();
  const state = app.state;
  if (!state) return null;
  return (
    <View>
      <Text style={styles.copy}>Try the whole daily loop: answer, wait for your sample partner, then reveal your shared Moment.</Text>
      <FieldLabel>Today’s Moment type</FieldLabel>
      <View style={{ gap: 8 }}>
        {catalog.map((item, index) => (
          <ChoiceButton key={item.title} label={`${item.type} — ${item.title}`} selected={state.index === index} onPress={() => !state.answer && app.setMomentIndex(index)} />
        ))}
      </View>
      <InsetNote>
        {state.answer
          ? 'Finish this Moment before trying the next day, or reset the demo to start again.'
          : 'Switch types before answering to explore Questions, Appreciation, Actions, Choices, and Check-ins.'}
      </InsetNote>
      <View style={{ marginTop: 16, gap: 10 }}>
        {state.partnerDone ? (
          <PrimaryButton label="Try the next demo day" onPress={app.nextDay} />
        ) : state.answer ? (
          <PrimaryButton label="Simulate partner finishing" onPress={app.partnerCompletes} />
        ) : (
          <PrimaryButton label="Back to our Moment" onPress={app.closeModal} />
        )}
        <SecondaryButton
          label={app.sundayPreview ? 'End Sunday preview' : 'Preview Sunday reflection'}
          onPress={() => {
            app.setSundayPreview(!app.sundayPreview);
            app.closeModal();
            app.goTab('today');
          }}
        />
        <SecondaryButton label="Preview welcome & pairing" onPress={() => app.setModal({ name: 'welcome' })} />
        <QuietButton label="Reset all demo data" onPress={() => app.setModal({ name: 'reset' })} />
      </View>
    </View>
  );
}

function PartnerUpdate() {
  const app = useApp();
  const state = app.state;
  if (!state) return null;
  return (
    <View>
      <InsetNote>Sample partner update. In the real app, this view would show only what your partner chooses to share.</InsetNote>
      <PreviewItem label="How I’m feeling" value={SAMPLE_PARTNER_UPDATE.feeling} />
      <PreviewItem label="What would help" value={SAMPLE_PARTNER_UPDATE.help} />
      <Text style={styles.copy}>A small piece of context. You can always ask how they’re doing.</Text>
      <PrimaryButton label="Update my own day" onPress={app.openWellbeing} />
    </View>
  );
}

function NamesForm() {
  const app = useApp();
  const [me, setMe] = useState(app.state?.me ?? '');
  const [partner, setPartner] = useState(app.state?.partner ?? '');
  const [error, setError] = useState('');
  return (
    <View>
      <Text style={styles.copy}>Try the demo with your names. These stay on this phone and aren’t sent anywhere.</Text>
      <FieldLabel>Your first name</FieldLabel>
      <TextField value={me} maxLength={24} onChangeText={setMe} />
      <FieldLabel>Your partner’s first name</FieldLabel>
      <TextField value={partner} maxLength={24} onChangeText={setPartner} />
      <ErrorText>{error}</ErrorText>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          label="Continue demo"
          onPress={() => {
            const message = app.saveNames(me, partner);
            if (message) setError(message);
          }}
        />
      </View>
    </View>
  );
}

function PairForm() {
  const app = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  return (
    <View>
      <Text style={styles.copy}>In the real app, one partner will share an invite code and the other will join. Try the sample code below.</Text>
      <InsetNote>{`Sample partner code: ${PAIR_CODE}\nThis is a pairing preview, not a live invitation.`}</InsetNote>
      <FieldLabel>Partner code</FieldLabel>
      <TextField value={code} maxLength={12} autoCapitalize="characters" placeholder="Enter MOMENT" onChangeText={setCode} />
      <ErrorText>{error}</ErrorText>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          label="Connect sample couple"
          onPress={() => {
            if (code.trim().toUpperCase() !== PAIR_CODE) {
              setError('That sample code isn’t a match. Try MOMENT.');
              return;
            }
            app.setModal({ name: 'paired' });
          }}
        />
      </View>
    </View>
  );
}

function Paired() {
  const app = useApp();
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.art}>
        <Icon name="check" size={28} color="#8b91b7" />
      </View>
      <Text style={styles.copyCenter}>Your sample couple is connected.{'\n'}Your first Moment is ready.</Text>
      <InsetNote>Demo preview only. Real pairing will connect two separate accounts.</InsetNote>
      <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
        <PrimaryButton label="Open our Moment" onPress={() => { app.closeModal(); app.goTab('today'); }} />
      </View>
    </View>
  );
}

function Privacy() {
  const app = useApp();
  const lines = [
    'Names, answers, and settings are saved only on this phone.',
    'Pairing, partner replies, memories, and reminders use sample data. No invitations, messages, or push notifications are sent.',
    'Hidden answers in this demo are a visual simulation. Real answer privacy will need server-side access rules.',
    'Wellbeing cards and wearable readings use sample data. Sharing controls only change the partner-view preview; nothing is sent.',
    'No accounts exist here. Account deletion and unpairing will be built with a real account system.',
    'Use sample answers while testing. Reset demo clears its saved data on this phone.',
  ];
  return (
    <View>
      <Text style={styles.copy}>This is a visual, interactive app. Here’s what to know while you explore.</Text>
      {lines.map((line) => (
        <Text key={line} style={styles.bullet}>• {line}</Text>
      ))}
      <View style={{ marginTop: 16 }}>
        <PrimaryButton label="Got it" icon="check" onPress={app.closeModal} />
      </View>
    </View>
  );
}

function Reset() {
  const app = useApp();
  return (
    <View>
      <Text style={styles.copy}>This will clear names, answers, and settings from this phone, then restore the sample couple and memories.</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <SecondaryButton label="Keep exploring" onPress={app.closeModal} />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton label="Reset demo" icon={null} onPress={app.resetDemo} />
        </View>
      </View>
    </View>
  );
}

function Memory({ date }: { date: string }) {
  const record = useApp().state?.history.find((item) => item.date === date);
  if (!record) return null;
  return (
    <View>
      <Text style={styles.kicker}>{catalog[record.index].type} · OUR MEMORY</Text>
      <MomentFlow record={record} />
    </View>
  );
}

function TaskForm({ id, preset }: { id?: string; preset?: { title: string; owner: 'me' | 'us'; note: string } }) {
  const app = useApp();
  const existing = app.state?.todos.find((task) => task.id === id);
  const [title, setTitle] = useState(existing?.title ?? preset?.title ?? '');
  const [owner, setOwner] = useState<'me' | 'us'>(existing?.owner ?? preset?.owner ?? 'us');
  const [due, setDue] = useState(existing?.due ?? '');
  const [note, setNote] = useState(existing?.note ?? preset?.note ?? '');
  const [error, setError] = useState('');
  const [showDate, setShowDate] = useState(!!existing?.due);
  return (
    <View>
      <Text style={styles.copy}>A plan, a conversation, a personal intention. Keep it as small as you need.</Text>
      <FieldLabel>What would you like to do?</FieldLabel>
      <TextField value={title} maxLength={100} placeholder="Make time for a quiet catch-up…" onChangeText={setTitle} />
      <FieldLabel>Who is this for?</FieldLabel>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <ChoiceButton label="For us" selected={owner === 'us'} onPress={() => setOwner('us')} />
        </View>
        <View style={{ flex: 1 }}>
          <ChoiceButton label="For me" selected={owner === 'me'} onPress={() => setOwner('me')} />
        </View>
      </View>
      <FieldLabel>A date, if you want one</FieldLabel>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{due ? prettyDate(due, { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date'}</Text>
        <Switch
          value={showDate}
          onValueChange={(on) => {
            setShowDate(on);
            if (!on) setDue('');
            else if (!due) setDue(dateKey(new Date()));
          }}
          trackColor={{ true: '#a6a4cd', false: '#dfe2ed' }}
        />
      </View>
      {showDate ? (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          value={due ? new Date(due + 'T12:00:00') : new Date()}
          onValueChange={(_event, date) => {
            if (date) setDue(dateKey(date));
          }}
        />
      ) : null}
      <FieldLabel>A little note</FieldLabel>
      <TextField multiline value={note} maxLength={500} placeholder="Anything that would help…" onChangeText={setNote} />
      <InsetNote>“For us” is a shared-list preview. Nothing is sent to your partner in this demo.</InsetNote>
      <ErrorText>{error}</ErrorText>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          label={existing ? 'Save changes' : 'Add to our list'}
          icon="check"
          onPress={() => {
            const message = app.saveTask({ id, title, owner, due, note });
            if (message) setError(message);
          }}
        />
      </View>
    </View>
  );
}

function SupportForm() {
  const app = useApp();
  const [need, setNeed] = useState(SUPPORT_NEEDS[0]);
  const [when, setWhen] = useState('');
  return (
    <View>
      <Text style={styles.copy}>You don’t need the perfect explanation to ask for a little care.</Text>
      <FieldLabel>What do you need right now?</FieldLabel>
      <View style={{ gap: 8 }}>
        {SUPPORT_NEEDS.map((option) => (
          <ChoiceButton key={option} label={option} selected={need === option} onPress={() => setNeed(option)} />
        ))}
      </View>
      <FieldLabel>When could you reconnect?</FieldLabel>
      <TextField value={when} maxLength={80} placeholder="After dinner, or in about 30 minutes…" onChangeText={setWhen} />
      <InsetNote>This saves a private note to your wellbeing card. You can choose what to share afterward. No message is sent.</InsetNote>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton label="Save what I need" icon="check" onPress={() => app.saveSupport(need, when)} />
      </View>
    </View>
  );
}

export function Foundations() {
  return (
    <View style={styles.foundations}>
      <Text style={styles.kicker}>OUR FOUR FOUNDATIONS</Text>
      <Text style={styles.sectionTitle}>The everyday essentials.</Text>
      <Text style={styles.copy}>Things we practice, without scoring each other.</Text>
      {FOUNDATIONS.map(([name, copy], index) => (
        <View key={name} style={styles.foundation}>
          <Text style={styles.foundationIndex}>0{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.foundationName}>{name}</Text>
            <Text style={styles.foundationCopy}>{copy}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function WellbeingForm() {
  const app = useApp();
  const draft = app.wellbeingDraft;
  const state = app.state;
  if (!draft || !state) return null;
  const set = (recipe: (w: Wellbeing) => Wellbeing) => app.updateDraft(recipe);
  const shared = sharedWellbeing(draft);
  return (
    <View>
      <Text style={styles.copy}>Your words describe your feelings. Wearable readings can add a little context.</Text>
      <FieldLabel>How are you feeling?</FieldLabel>
      <View style={{ gap: 8 }}>
        <ChoiceButton label="Choose how you feel" selected={draft.mood === ''} onPress={() => set((w) => ({ ...w, mood: '' }))} />
        {WELLBEING_MOODS.map((mood) => (
          <ChoiceButton key={mood} label={mood} selected={draft.mood === mood} onPress={() => set((w) => ({ ...w, mood }))} />
        ))}
      </View>
      <FieldLabel>What would help today?</FieldLabel>
      <TextField multiline value={draft.need} maxLength={300} placeholder="A hug, a quiet evening, a little encouragement…" onChangeText={(need) => set((w) => ({ ...w, need }))} />
      <Pressable style={styles.wearableRow} onPress={() => app.openWearable(false)}>
        <Text style={styles.wearableText}>{draft.device ? 'Oura sample added' : 'Want more context?'}</Text>
        <Text style={styles.link}>{draft.device ? 'Manage sample' : 'Explore wearable preview'}</Text>
      </Pressable>
      <Text style={styles.shareTitle}>What would {state.partner} see?</Text>
      <Text style={styles.hint}>Nothing is shared by default. Pick each item yourself.</Text>
      <ShareRow label="My mood" checked={draft.share.mood} onPress={() => set((w) => ({ ...w, share: { ...w.share, mood: !w.share.mood } }))} />
      <ShareRow label="What would help me" checked={draft.share.need} onPress={() => set((w) => ({ ...w, share: { ...w.share, need: !w.share.need } }))} />
      <ShareRow label="My sleep summary · sample" checked={draft.share.sleep} disabled={!draft.device} onPress={() => set((w) => ({ ...w, share: { ...w.share, sleep: !w.share.sleep } }))} />
      <ShareRow label="My readiness summary · sample" checked={draft.share.readiness} disabled={!draft.device} onPress={() => set((w) => ({ ...w, share: { ...w.share, readiness: !w.share.readiness } }))} />
      <InsetNote>Sharing is simulated in this demo. No health data is imported and nothing is sent to your partner.</InsetNote>
      <View style={{ marginTop: 16, gap: 10 }}>
        <PrimaryButton label="Save my day" icon="check" onPress={app.saveWellbeingDraft} />
        <SecondaryButton label="Preview what my partner sees" onPress={() => app.setModal({ name: 'partner-view' })} />
        {shared.length ? <QuietButton label="Make everything private" onPress={app.makeWellbeingPrivate} /> : null}
      </View>
    </View>
  );
}

function PartnerPreview() {
  const app = useApp();
  const state = app.state;
  const draft = app.wellbeingDraft;
  if (!state || !draft) return null;
  const list = sharedWellbeing(draft);
  return (
    <View>
      <Text style={styles.copy}>This is what {state.partner} would see for {state.me}. This preview does not send anything.</Text>
      {list.length ? (
        list.map(([label, value]) => <PreviewItem key={label} label={label} value={value} />)
      ) : (
        <View style={styles.empty}>
          <Icon name="lock" size={26} color="#a3a2bf" />
          <Text style={styles.sectionTitle}>Just for you, for now.</Text>
          <Text style={styles.copyCenter}>No wellbeing items are selected for sharing.</Text>
        </View>
      )}
      <InsetNote>A sleep or readiness score is context, not a description of your emotions. Only you can say how you feel.</InsetNote>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton label="Back to my choices" onPress={app.returnToWellbeing} />
      </View>
    </View>
  );
}

function Wearable() {
  const app = useApp();
  const draft = app.wellbeingDraft;
  if (!draft) return null;
  return (
    <View>
      <Text style={styles.copy}>Explore how a wearable could add context to your day. You decide what your partner would see.</Text>
      <View style={styles.device}>
        <View style={styles.ring} />
        <View>
          <Text style={styles.sectionTitle}>Oura Ring</Text>
          <Text style={styles.kicker}>SAMPLE DATA · NOT CONNECTED</Text>
        </View>
      </View>
      <View style={styles.metrics}>
        <View style={{ flex: 1 }}>
          <Text style={styles.metric}>6h 12m</Text>
          <Text style={styles.metricLabel}>Sleep summary</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.metric}>68 / 100</Text>
          <Text style={styles.metricLabel}>Readiness summary</Text>
        </View>
      </View>
      <InsetNote>This only adds sample readings. It does not sign in to Oura, access a ring, or share health information.</InsetNote>
      <Text style={styles.hint}>Apple Watch, Fitbit, and Garmin are ideas for later. Their connections aren’t available in this demo.</Text>
      <View style={{ marginTop: 16, gap: 10 }}>
        <PrimaryButton label={draft.device ? 'Keep sample readings' : 'Try Oura sample readings'} onPress={() => app.toggleDevice(true)} />
        {draft.device ? <SecondaryButton label="Remove sample readings" onPress={() => app.toggleDevice(false)} /> : null}
        <QuietButton label="Back to my wellbeing" onPress={app.returnToWellbeing} />
      </View>
    </View>
  );
}

function blankDebrief(): { title: string; answers: DebriefAnswers; share: DebriefShare } {
  return {
    title: '',
    answers: { highlight: '', unspoken: '', next: '', connected: '' },
    share: { highlight: false, unspoken: false, next: false, connected: false },
  };
}

function DebriefForm({ id }: { id?: string }) {
  const app = useApp();
  const existing = app.state?.debriefs.find((item) => item.id === id);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [answers, setAnswers] = useState<DebriefAnswers>(existing?.answers ?? blankDebrief().answers);
  const [share, setShare] = useState<DebriefShare>(existing?.share ?? blankDebrief().share);
  const [error, setError] = useState('');
  const date = existing?.date ?? app.state?.date ?? '';
  return (
    <View>
      <Text style={styles.copy}>No need to rate the hangout or your partner. Just notice how it felt for you.</Text>
      <FieldLabel>What did you do together?</FieldLabel>
      <TextField value={title} maxLength={60} placeholder="Coffee, a walk, a cozy night in…" onChangeText={setTitle} />
      <Text style={styles.fine}>{prettyDate(date, { month: 'long', day: 'numeric' })} · Everything is optional</Text>
      <FieldBlock label={DEBRIEF_FIELDS[0][1]} hint={DEBRIEF_FIELDS[0][2]} value={answers.highlight} shared={share.highlight} onChange={(highlight) => setAnswers({ ...answers, highlight })} onShare={() => setShare({ ...share, highlight: !share.highlight })} />
      <FieldLabel>How connected did you feel?</FieldLabel>
      <View style={{ gap: 8 }}>
        <ChoiceButton label="Skip this question" selected={answers.connected === ''} onPress={() => setAnswers({ ...answers, connected: '' })} />
        {CONNECTION_LABELS.map((label, index) => {
          const value = String(index + 1);
          return <ChoiceButton key={label} label={`${value} — ${label}`} selected={answers.connected === value} onPress={() => setAnswers({ ...answers, connected: value })} />;
        })}
      </View>
      <ShareRow label="Share this answer in the partner preview" checked={share.connected} onPress={() => setShare({ ...share, connected: !share.connected })} />
      {DEBRIEF_FIELDS.slice(1).map(([key, label, hint]) => (
        <FieldBlock
          key={key}
          label={label}
          hint={hint}
          value={answers[key]}
          shared={share[key]}
          onChange={(value) => setAnswers({ ...answers, [key]: value })}
          onShare={() => setShare({ ...share, [key]: !share[key] })}
        />
      ))}
      <InsetNote>Your reflection starts private. Choose individual answers to include in the partner preview. Nothing is sent in this demo.</InsetNote>
      <ErrorText>{error}</ErrorText>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          label="Save my debrief"
          icon="check"
          onPress={() => {
            const message = app.saveDebrief({ id, title, answers, share });
            if (message) setError(message);
          }}
        />
      </View>
    </View>
  );
}

function FieldBlock({ label, hint, value, shared, onChange, onShare }: { label: string; hint: string; value: string; shared: boolean; onChange: (value: string) => void; onShare: () => void }) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <TextField multiline value={value} maxLength={600} placeholder={hint} onChangeText={onChange} />
      <ShareRow label="Share this answer in the partner preview" checked={shared} onPress={onShare} />
    </View>
  );
}

function DebriefDetail({ id, partner }: { id: string; partner: boolean }) {
  const app = useApp();
  const debrief = app.state?.debriefs.find((item) => item.id === id);
  if (!debrief) return null;
  return <DebriefBody debrief={debrief} partner={partner} onBack={() => app.setModal({ name: 'debrief-detail', id, partner: false })} onEdit={() => app.setModal({ name: 'debrief', id })} onPreview={() => app.setModal({ name: 'debrief-detail', id, partner: true })} />;
}

function DebriefBody({ debrief, partner, onBack, onEdit, onPreview }: { debrief: Debrief; partner: boolean; onBack: () => void; onEdit: () => void; onPreview: () => void }) {
  const fields = debriefFields(debrief, partner);
  return (
    <View>
      <Text style={styles.kicker}>{prettyDate(debrief.date, { month: 'long', day: 'numeric' })} · {partner ? 'PARTNER VIEW PREVIEW' : 'YOUR REFLECTION'}</Text>
      <InsetNote>{partner ? 'Only selected answers appear here. This preview does not send anything.' : 'Your own view includes private answers. The partner preview includes only answers you chose to share.'}</InsetNote>
      {fields.length ? (
        fields.map((field) => (
          <PreviewItem key={field.label} label={field.label} value={field.value} aside={partner ? undefined : field.shared ? 'Included in partner preview' : 'Private'} />
        ))
      ) : (
        <View style={styles.empty}>
          <Icon name="lock" size={26} color="#a3a2bf" />
          <Text style={styles.sectionTitle}>This one is just for you.</Text>
          <Text style={styles.copyCenter}>No answers were selected for sharing.</Text>
        </View>
      )}
      <View style={{ marginTop: 16, gap: 10 }}>
        {partner ? (
          <PrimaryButton label="Back to my reflection" icon={null} onPress={onBack} />
        ) : (
          <>
            <PrimaryButton label="Preview partner view" onPress={onPreview} />
            <SecondaryButton label="Edit reflection & sharing" onPress={onEdit} />
          </>
        )}
      </View>
    </View>
  );
}

function Weekly({ keyName }: { keyName?: string }) {
  const app = useApp();
  const state = app.state;
  if (!state) return null;
  const key = keyName ?? weekKey(state.date);
  const record = keyName ? state.reflections[key] : reflectionRecord(state, key);
  const [error, setError] = useState('');
  if (!record) return null;
  if (record.revealed) {
    return (
      <View>
        <View style={styles.pill}>
          <Icon name="check" size={13} color="#73907e" />
          <Text style={styles.pillText}>OUR WEEK, TOGETHER</Text>
        </View>
        <Text style={styles.copy}>Read with curiosity. Talk through one thing at a time.</Text>
        <ReflectionAnswers name={state.me} loved={record.loved} better={record.better} strong={record.strong} care={record.care} />
        {record.partner ? <ReflectionAnswers name={state.partner} loved={record.partner.loved} better={record.partner.better} strong={record.partner.strong} care={record.partner.care} /> : null}
        {!keyName ? (
          <SecondaryButton
            label="Choose one small intention for next week"
            icon="arrow"
            onPress={() => app.openPlan({ title: 'Practice one small change from our reflection', owner: 'us', note: 'Choose one specific, doable action together.' })}
          />
        ) : null}
      </View>
    );
  }
  if (record.submitted) {
    return (
      <View>
        <View style={styles.art}>
          <Icon name="lock" size={28} color="#8b91b7" />
        </View>
        <Text style={styles.sectionTitle}>Your reflection is saved.</Text>
        <Text style={styles.copyCenter}>{record.partnerDone ? 'You both finished. Open your reflections when you’re ready.' : 'Your partner’s answers stay hidden until you both finish.'}</Text>
        <InsetNote>Demo only. Hidden answers are a visual simulation.</InsetNote>
        <View style={{ marginTop: 16 }}>
          <PrimaryButton
            label={record.partnerDone ? 'Reveal our reflections' : `Simulate ${state.partner} finishing`}
            icon={null}
            onPress={record.partnerDone ? app.revealReflection : app.partnerReflection}
          />
        </View>
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.copy}>Answer from your own experience. Be specific and kind. One example is enough; three is welcome.</Text>
      <InsetNote>{`You’re answering about ${state.partner}. Your draft stays private on this phone.`}</InsetNote>
      <ReflectionInputs title="What are three things I did this week that made you feel loved?" values={record.loved} onChange={(index, value) => app.updateReflection((current) => ({ ...current, loved: current.loved.map((item, i) => (i === index ? value.slice(0, 240) : item)) }))} />
      <ReflectionInputs title="What are three things I could have done differently to help you feel more loved or supported?" values={record.better} onChange={(index, value) => app.updateReflection((current) => ({ ...current, better: current.better.map((item, i) => (i === index ? value.slice(0, 240) : item)) }))} />
      <Text style={styles.hint}>The “I” in each question means {state.partner}. Share what their actions meant to you, and what would help next time.</Text>
      <FieldLabel>Which foundation felt strongest?</FieldLabel>
      <FoundationPicker value={record.strong} onChange={(strong) => app.updateReflection((current) => ({ ...current, strong }))} />
      <FieldLabel>Which could use a little more care?</FieldLabel>
      <FoundationPicker value={record.care} onChange={(care) => app.updateReflection((current) => ({ ...current, care }))} />
      <ErrorText>{error}</ErrorText>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          label="Save my reflection"
          icon="lock"
          onPress={() => {
            const message = app.submitReflection();
            if (message) setError(message);
          }}
        />
      </View>
      <QuietButton label="Later · keep my private draft" onPress={app.closeModal} />
    </View>
  );
}

function ReflectionInputs({ title, values, onChange }: { title: string; values: string[]; onChange: (index: number, value: string) => void }) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.question}>{title}</Text>
      {[0, 1, 2].map((index) => (
        <View key={index} style={styles.reflectRow}>
          <Text style={styles.reflectIndex}>{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <TextField value={values[index] ?? ''} maxLength={240} placeholder="One specific moment…" onChangeText={(value) => onChange(index, value)} />
          </View>
        </View>
      ))}
    </View>
  );
}

function FoundationPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <ChoiceButton label="Choose if you’d like" selected={value === ''} onPress={() => onChange('')} />
      {FOUNDATIONS.map(([name]) => (
        <ChoiceButton key={name} label={name} selected={value === name} onPress={() => onChange(name)} />
      ))}
    </View>
  );
}

function ReflectionAnswers({ name, loved, better, strong, care }: { name: string; loved: string[]; better: string[]; strong: string; care: string }) {
  return (
    <View style={styles.response}>
      <Text style={styles.responseLabel}>{name}</Text>
      <Text style={styles.responseHeading}>What helped me feel loved</Text>
      {loved.filter(Boolean).map((item) => (
        <Text key={item} style={styles.responseItem}>• {item}</Text>
      ))}
      <Text style={styles.responseHeading}>What would help next time</Text>
      {better.filter(Boolean).map((item) => (
        <Text key={item} style={styles.responseItem}>• {item}</Text>
      ))}
      {strong ? <Text style={styles.responseItem}>Felt strong: {strong}</Text> : null}
      {care ? <Text style={styles.responseItem}>More care: {care}</Text> : null}
    </View>
  );
}

function PauseForm() {
  const app = useApp();
  const plan = app.state?.pausePlan;
  const [need, setNeed] = useState(plan?.need || PAUSE_NEEDS[0]);
  const [when, setWhen] = useState(plan?.when ?? '');
  const [note, setNote] = useState(plan?.note ?? '');
  const [error, setError] = useState('');
  return (
    <View>
      <Text style={styles.copy}>Sometimes you need space before you can find your words. Give that space a gentle return point.</Text>
      <FieldLabel>What would help right now?</FieldLabel>
      <View style={{ gap: 8 }}>
        {PAUSE_NEEDS.map((option) => (
          <ChoiceButton key={option} label={option} selected={need === option} onPress={() => setNeed(option)} />
        ))}
      </View>
      <FieldLabel>When would you like to talk again?</FieldLabel>
      <TextField value={when} maxLength={80} placeholder="Tonight at 7, or in 30 minutes" onChangeText={setWhen} />
      <FieldLabel>What would you like them to know?</FieldLabel>
      <TextField multiline value={note} maxLength={300} placeholder="I care about us. I’m having trouble finding my words." onChangeText={setNote} />
      <InsetNote>Private draft only. Nothing is sent and no reminder is scheduled. A return time is a request you can agree on together.</InsetNote>
      <ErrorText>{error}</ErrorText>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          label="Preview my words"
          onPress={() => {
            if (!app.savePause({ need, when, note })) setError('Add a time you’d like to talk again.');
          }}
        />
      </View>
      {plan?.when ? <QuietButton label={plan.done ? 'We’ve marked this as reconnected' : 'We’ve reconnected'} onPress={app.markReconnected} /> : null}
    </View>
  );
}

function PausePreview() {
  const app = useApp();
  const plan = app.state?.pausePlan;
  if (!plan) return null;
  return (
    <View>
      <Text style={styles.kicker}>YOUR PRIVATE DRAFT</Text>
      <View style={styles.quote}>
        <Text style={styles.quoteText}>“I need {plan.need.toLowerCase()}. {plan.note} Could we come back to this {plan.when}?”</Text>
      </View>
      <Text style={styles.copy}>You can use these words in person or in your own message.</Text>
      <View style={{ gap: 10 }}>
        <PrimaryButton label="Keep this in your list" icon="check" onPress={app.closeModal} />
        <SecondaryButton label="Edit my words" onPress={() => app.setModal({ name: 'pause' })} />
      </View>
    </View>
  );
}

function PreviewItem({ label, value, aside }: { label: string; value: string; aside?: string }) {
  return (
    <View style={styles.preview}>
      <View style={styles.previewTop}>
        <Text style={styles.previewLabel}>{label}</Text>
        {aside ? <Text style={styles.aside}>{aside}</Text> : null}
      </View>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

function ShareRow({ label, checked, disabled, onPress }: { label: string; checked: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked, disabled }} disabled={disabled} onPress={onPress} style={[styles.share, disabled && { opacity: 0.45 }]}>
      <View style={[styles.box, checked && styles.boxOn]}>{checked ? <Icon name="check" size={12} color="#fff" /> : null}</View>
      <Text style={styles.shareText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
  copyCenter: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginVertical: 12 },
  hint: { color: '#999db2', fontSize: 13, lineHeight: 19, marginTop: 12 },
  fine: { color: '#a0a6b6', fontSize: 12, marginTop: 8 },
  kicker: { fontSize: 11, letterSpacing: 1.2, fontWeight: '600', color: '#9b9bb5', marginTop: 12 },
  welcomeTitle: { fontFamily: serif, fontSize: 32, lineHeight: 38, textAlign: 'center', color: colors.ink, marginTop: 8 },
  focus: { minHeight: 84, borderWidth: 1, borderColor: '#e5e4f0', backgroundColor: '#fff', borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  focusOn: { backgroundColor: '#f1eefb', borderColor: '#b2abda' },
  focusIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f3f2f9', alignItems: 'center', justifyContent: 'center' },
  focusTitle: { color: '#6b7895', fontSize: 15, marginBottom: 4 },
  focusDesc: { color: '#949bb0', fontSize: 13, lineHeight: 18 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#c9cee0', alignItems: 'center', justifyContent: 'center' },
  focusBox: { position: 'absolute', right: 14 },
  boxOn: { backgroundColor: '#8b8bb5', borderColor: '#8b8bb5' },
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  bullet: { color: '#818ba2', fontSize: 14, lineHeight: 21, marginTop: 12 },
  art: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#eef2fc', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  foundations: { backgroundColor: '#f6f5fc', borderRadius: 20, padding: 18, marginTop: 8 },
  sectionTitle: { fontFamily: serif, fontSize: 26, color: colors.ink, marginTop: 8 },
  foundation: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#e3e2ee' },
  foundationIndex: { color: '#9791b9', width: 24, paddingTop: 2 },
  foundationName: { fontSize: 16, color: colors.ink, marginBottom: 4 },
  foundationCopy: { color: '#737d94', fontSize: 14, lineHeight: 20 },
  share: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  shareText: { flex: 1, color: '#7d89a2', fontSize: 14 },
  shareTitle: { marginTop: 20, fontSize: 15, fontWeight: '600', color: '#7b85a0' },
  wearableRow: { marginTop: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: '#dcd9ec', borderRadius: 12, padding: 12 },
  wearableText: { color: '#9692b2', fontSize: 13 },
  link: { color: '#8a88ad', fontSize: 13, marginTop: 6, fontWeight: '600' },
  preview: { borderWidth: 1, borderColor: '#e9e9f3', backgroundColor: '#f5f6fd', borderRadius: 13, padding: 14, marginTop: 12 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  previewLabel: { fontSize: 11, letterSpacing: 0.4, color: '#959db2', textTransform: 'uppercase' },
  aside: { fontSize: 11, color: '#9aa1b1' },
  previewValue: { fontFamily: serif, fontSize: 18, lineHeight: 26, color: colors.ink, marginTop: 6 },
  empty: { alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#dddbea', borderRadius: 14, padding: 24, marginTop: 16 },
  device: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f3f2fb', borderRadius: 15, padding: 16, marginTop: 16 },
  ring: { width: 36, height: 36, borderRadius: 18, borderWidth: 6, borderColor: '#a4a8c5' },
  metrics: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16, marginTop: 12 },
  metric: { fontFamily: serif, fontSize: 26, color: '#7485a6' },
  metricLabel: { color: '#929cb0', fontSize: 12, marginTop: 4 },
  question: { fontSize: 16, fontWeight: '600', color: colors.ink, lineHeight: 22 },
  reflectRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  reflectIndex: { width: 16, color: '#9892b2' },
  response: { backgroundColor: '#f5f1fc', borderRadius: 13, padding: 14, marginTop: 12 },
  responseLabel: { fontSize: 12, fontWeight: '600', color: '#998bb7', marginBottom: 8 },
  responseHeading: { fontSize: 15, color: colors.ink, marginTop: 10, marginBottom: 4 },
  responseItem: { color: colors.ink, fontSize: 15, lineHeight: 22, marginTop: 4 },
  quote: { backgroundColor: '#f0eef9', borderRadius: 20, padding: 18, marginVertical: 14 },
  quoteText: { fontSize: 18, lineHeight: 28, color: '#4f5477' },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#edf4ef', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  pillText: { color: '#73907e', fontSize: 11, fontWeight: '600' },
  switchRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: colors.ink, fontSize: 15 },
});
