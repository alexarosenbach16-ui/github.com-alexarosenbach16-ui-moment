# Moment — interactive demo

An owner-private, responsive first-look prototype based on Alexa’s Moment V1 brief. Uses the supplied Moment logo, blue/lavender brand palette, and Today / Memories / Us navigation.

## Try it

1. Write a sample answer and select **Save my Moment**.
2. Select **Simulate Jamie finishing**.
3. Select **Reveal our Moment**. The shared streak increases once and the Moment appears in Memories.
4. Use **Try the next demo day** or **Demo controls** to explore five activity types.
5. In Us, personalize the names, explore reminder preference previews, or reset.
6. Welcome/pairing is available in Demo controls. The sample code is `MOMENT`.

## Scope

This is a browser prototype, not the production Expo app. Pairing, partner responses, reminders, streak dates, and historical entries use sample data. No authentication, Supabase service, messaging, push delivery, subscriptions, analytics, or server-side privacy is connected. Browser storage preserves demo edits when available. Use sample answers; reset clears the demo state.

The reveal is a visual simulation only. The production implementation must gate partner response reads at the database, enforce two-member pairing, and compute completion/streaks in server-side transactions using a canonical couple timezone.

## Files

- `dist/index.html`, `styles.css`, `app.js`: dependency-free demo.
- `dist/assets/moment-logo.png`: user-supplied logo, unchanged.
- `tests/demo.test.cjs`: shared completion/streak/date/state validation checks.
- `.openai/hosting.json`: hosting identity/configuration.

## Validation

Run `node --check dist/app.js` and `node tests/demo.test.cjs`.
Browser QA covers desktop and a 390-pixel mobile frame, entry/waiting/reveal, memory detail, navigation, sample pairing, and personalization.

## Next phase

Implement the approved Expo + TypeScript application, Supabase schema/RLS, real auth and pairing, backend-gated reveal, canonical timezone handling, account deletion/unpairing, and notification delivery. The demo establishes visual direction and interaction, not production readiness.

## Optional connection tools (second demo)

- Today now has optional wellbeing and hangout debrief cards; neither affects shared streaks.
- Wellbeing includes a user-selected mood, support note, and optional Oura sample readings.
- Mood, support note, sleep, and readiness each have a separate sharing choice, all off by default. The partner-view preview renders only selected values.
- Oura readings are entirely simulated. No OAuth, real wearable data access, or health-data transfer is implemented. Other device brands are listed as future ideas only.
- Debriefs support a hangout title, favorite part, self-rated connection, unspoken thoughts, and a next-time idea. Each answer is independently private or included in the simulated partner view.
- Debriefs are saved in a separate Memories section and can be edited.
- Phone controls use at least 44-pixel key tap targets, 16-pixel form inputs to avoid iOS focus zoom, safe-area padding, and scrollable dialogs.
- Additional checks cover sharing defaults, field-level visibility, date separation, and streak independence.

## Updated direction: a shared space, with optional tools

The latest user direction supersedes the intentionally narrow first brief. Moment now supports starting over, communication, long distance, and everyday connection. Couples choose one or more focuses on first launch and can update them in Us without resetting history, tasks, or completed daily responses.

### Four tabs

- **Today:** compact daily Moment summary, sample partner update, and a single need-sharing shortcut. The full activity opens in a dialog.
- **To Do:** personal/shared intentions, optional dates and notes, completion/reopening, filters, and add-only-if-useful suggestions based on focus. The Explore tools section contains wellbeing, debriefs, a support-phrase builder, planning, and the wearable preview.
- **Memories:** completed daily Moments plus privately saved/optionally shared debriefs.
- **Us:** current focus, names, settings, and wellbeing/sharing controls.

Task completion and optional tools do not affect the shared daily Moment streak. Focus-specific prompts preserve any response already in progress. The support-phrase builder saves a private wellbeing note; sharing remains a separate choice.

`dist/product.js` contains focus selection, compact Today, task management, and tool navigation. Tests also cover multiple focuses, suggestion deduplication, task toggling/filtering, and preservation of history and in-progress responses.

## Sunday reflection and relationship foundations

Sunday adds one reflection card to Today. Demo controls can preview it on other days without changing the date or daily progress. This Week in To Do keeps the reflection accessible later. Drafts save locally; both simulated partners must finish before reveal, and revealed reflections appear in Memories. Each week starts on Sunday using the demo's existing date. No notifications are scheduled.

Us now explains emotional safety, consideration, consistency, and repair. Reflection prompts optionally name a foundation that felt strong and one needing care. A next-week intention can be added to the existing task list.

Pause & reconnect in Explore tools creates a private request for space with a proposed return time. Its draft remains in This Week, can be edited, and can be marked reconnected. It sends no messages and schedules no reminders. These tools do not alter the daily streak.

## Features tab

Five tabs: Today, To Do, Features, Memories, Us. Features holds Sunday reflections, foundations, Pause & reconnect, wellbeing, hangout debriefs, support phrases, planning, and wearable previews. To Do keeps tasks and This Week without the former Explore tools switch. Existing saved state is retained, including when reopening on Features.

## Choose optional features

Each Features card now has an Add to To Do / Remove from To Do control. The To Do tab opens only selected features as reusable tools, alongside the user's normal tasks. Selection defaults empty and persists locally across reloads; duplicate selections are prevented. Removing a feature preserves its drafts and Memories. The Sunday-only Today card remains in place.
