# Moment — complete source export

## Folders

- moment-demo/: Complete working browser demo, including JavaScript source, CSS, HTML, logo, tests, documentation and Sites hosting configuration.
- mobile-starter/: Expo Go app for iPhone. Today is a three-step checklist. Us holds profiles, pairing, and Settings. Saved on the device.

## Run the working demo

Requires Python 3. From moment-demo/ run:

    python3 -m http.server 8000 --directory dist

Open http://localhost:8000 in your browser. No dependency installation or build is required.

## Run the demo checks

Requires Node.js. From moment-demo/ run:

    node tests/demo.test.cjs

## Mobile app (Expo Go)

The iPhone app lives in `mobile-starter/`. Today is a short checklist: the daily question, a mood check-in, and one shared to-do, plus an invite until you pair. Us holds profiles, pairing, and five settings rows. History groups answers by month and opens a year recap. Questions rotate without repeats, lean toward the tags picked in onboarding, and mix lighter and deeper prompts. One open day each week can stay in the streak as a grace day. Yesterday’s question can be answered within 48 hours. The sample partner is Ben and the code is `MOMENT`. Answers stay on the phone.

1. Install the free **Expo Go** app from the App Store. Use a current Expo Go, because this project is Expo SDK 58.
2. On a computer, open `mobile-starter` and install dependencies with `npm ci` if you have not already.
3. Run `npx expo start --tunnel`.
4. Scan the QR code with the iPhone camera, then open Moment in Expo Go.

Alexa and Ben each do this on their own phone. Nothing is sent between the phones.

## Scope

The browser demo includes Today, To Do, Features, Memories, Us, optional feature selection, Sunday reflections, the four foundations, hangout debriefs, wellbeing and simulated wearable readings, and Pause & reconnect. The phone app keeps that same data and those tools, with two tabs instead of five.

Accounts, phone-to-phone pairing, partner replies, wearable integration, and notifications are simulated. Browser storage keeps demo edits locally. Use sample data. Removing a feature from To Do preserves its saved data.

Project source files and configuration are included. Git internals, installed dependencies, caches, credentials and deployment archives are excluded; dependencies can be reinstalled from the mobile package lockfile. The Sites hosting configuration identifies the existing deployment but contains no credential.
