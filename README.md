# Moment — complete source export

## Folders

- moment-demo/: Complete working browser demo, including JavaScript source, CSS, HTML, logo, tests, documentation and Sites hosting configuration.
- mobile-starter/: Existing Expo / React Native starter project. This is an unimplemented starter, not the native version of the working demo.

## Run the working demo

Requires Python 3. From moment-demo/ run:

    python3 -m http.server 8000 --directory dist

Open http://localhost:8000 in your browser. No dependency installation or build is required.

## Run the demo checks

Requires Node.js. From moment-demo/ run:

    node tests/demo.test.cjs

## Mobile starter

From mobile-starter/, install the dependencies using npm ci, then use npm start. The starter is included as-is and has not been implemented or validated as a Moment mobile app.

## Scope

The working demo includes Today, To Do, Features, Memories, Us, optional feature selection, Sunday reflections, the four foundations, hangout debriefs, wellbeing and simulated wearable readings, and Pause & reconnect.

Accounts, phone-to-phone pairing, partner replies, wearable integration, and notifications are simulated. Browser storage keeps demo edits locally. Use sample data. Removing a feature from To Do preserves its saved data.

Project source files and configuration are included. Git internals, installed dependencies, caches, credentials and deployment archives are excluded; dependencies can be reinstalled from the mobile package lockfile. The Sites hosting configuration identifies the existing deployment but contains no credential.
