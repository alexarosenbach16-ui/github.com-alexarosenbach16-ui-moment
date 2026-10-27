# Moment for iPhone

Open Moment in the free **Expo Go** app. **Today** is three short steps (about a minute each): answer, mood, and one thing together. **Us** is profiles, pairing, and a short Settings list. History, reminders, and the other tools open from there.

The sample partner is Ben. One open day each week can stay in the streak as a grace day, and yesterday’s question can be answered within 48 hours if you want it counted. Moment Plus is a placeholder with a local cancel-reason list. No payments, and no push notifications (a real nudge needs a backend later).

## On each iPhone

1. Install **Expo Go** from the App Store.
2. This project uses **Expo SDK 58**, so update Expo Go if it asks you to.

## On the computer

From this folder:

```bash
npm ci
npx expo start --tunnel
```

Scan the QR code with the iPhone camera, then open the link in Expo Go.

Alexa and Ben can each do this on their own phone. Pairing is a preview: the sample code is `MOMENT`. Partner replies, reminders, and the Oura readings are samples. No account, message, or paid service is connected.

Names, daily Moments, check-ins, tasks, reflections, and sharing choices are saved with AsyncStorage and come back after the app restarts.
