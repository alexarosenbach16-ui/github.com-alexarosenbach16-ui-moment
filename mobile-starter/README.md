# Moment for iPhone

Open Moment in the free **Expo Go** app. Two tabs: **Today** (the daily question, a mood check-in, and shared to-dos) and **Us** (profiles, pairing, and Settings). History lists past answers and check-ins, newest first, and opens from Settings. Your answers stay on the phone.

Sunday reflections, foundations, pause and reconnect, support phrases, planning, hangout debriefs, wellbeing, and the wearable preview stay in Settings. Their saved data is still there.

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
