# Moment on two iPhones

This connects the Expo Go app in `mobile-starter/` to a free Supabase project. If the keys are missing, the app stays in the local demo.

## 1. Create a project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → API**.
3. Copy the project URL and the `anon` public key. Do not put the `service_role` key in the app.

## 2. Paste the database

1. Open **SQL Editor → New query**.
2. Paste the entire file `supabase/schema.sql`.
3. Run it once. It creates the tables, locks partner answers behind row level security, adds the couple functions, and seeds the 22 daily questions.

The partner’s answer text is not readable from the `answers` table. `sync_state` returns it only after both people have answered that day.

## 3. Turn off email confirmation

Open **Authentication → Providers → Email** (or **Authentication → Sign In / Providers → Email**) and turn **Confirm email** off.

Moment uses email and password, not magic links. With confirmation left on, sign-up will not return a session until the person clicks the email. The app tells them to confirm and then sign in.

## 4. Keys on the computer

From `mobile-starter/`, create a file named `.env` (it is gitignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Restart Expo after changing it:

```bash
npx expo start --tunnel
```

Open the project in Expo Go on both iPhones. Each person walks through onboarding, creates an account (18+), and enters a name. One person creates an invite code. The other enters that code. A couple holds exactly two people.

Pull down on Today to refresh. The app also checks again when it becomes active, about every 15 seconds, and listens for a partner’s “finished” flag when Realtime is available.

## 5. What each account can do

- **Sign out** forgets the session on this phone. Answers stay in Supabase.
- **Unpair** closes the shared space. Each person keeps their own answer text. The partner’s words are no longer shown.
- **Delete account** removes that person’s auth user and their rows. If the SQL delete is rejected, delete the user from **Authentication → Users** in the dashboard.

## Realtime

`schema.sql` adds `answer_flags` to the `supabase_realtime` publication. If that step prints a notice, open **Database → Publications → supabase_realtime** and enable `answer_flags`. The daily loop still updates by polling without it.

## What stays on the phone

Reminders are stored locally. There is still no push notification. Moment Plus is still a preview and does not bill anyone. Both phones should use the same time zone so “today” is the same date.
