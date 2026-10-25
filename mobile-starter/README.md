# Moment for iPhone

Open Moment in the free **Expo Go** app. This is the same demo as the website: Today, To Do, Features, Memories, and Us. Your answers stay on the phone.

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

Names, daily Moments, tasks, reflections, and sharing choices are saved with AsyncStorage and come back after the app restarts.
