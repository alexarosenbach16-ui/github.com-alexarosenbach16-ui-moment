# Moment for iPhone

Open Moment in the free **Expo Go** app. **Today** is three short steps (about a minute each): the daily question, a mood check-in, and one thing you appreciated. **Us** is profiles, pairing, and a short Settings list. History, reminders, and the other tools open from there.

The free plan keeps one Moment a day, the mood check-in, the shared streak, and the last 30 days of History. Older Moments stay saved. Moment Plus is a local preview for the couple: shared to-dos, bonus questions, date ideas, the year recap, full History, and extra Moments. Prices on that screen are a placeholder. Nothing is charged. A real nudge still needs a backend later.

The sample partner is Ben. One open day each week can stay in the streak as a grace day, and yesterday’s question can be answered within 48 hours if you want it counted. Settings, More tools, includes a demo switch to preview Plus on this phone.

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
