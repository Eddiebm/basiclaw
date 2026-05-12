# BasicLaw mobile (Expo)

Thin native shell around [basiclaw.app](https://basiclaw.app): Home shortcuts, Chat and Audit in WebViews (embed URLs), Library (static jurisdictions JSON → constitution WebView), Settings (locale, theme, Clerk sign-in link, push stub, TTS sample).

## Prerequisites

- Node 20+
- Xcode (iOS Simulator) and/or Android Studio (emulator)
- Optional: [EAS CLI](https://docs.expo.dev/build/setup/) for cloud builds (`npm i -g eas-cli`)

## Install

```bash
cd mobile
npm install
```

> This workspace has its own `package.json` and `node_modules` — keep it isolated from the Next.js app at the repo root.

## Development

```bash
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

### iOS Simulator

```bash
npm run ios
```

### Android

```bash
npm run android
```

## Deep linking

Registered scheme: **`basiclaw://`**

Examples:

- `basiclaw://chat` — opens the Chat tab (embed Ask).
- `basiclaw://audit` — opens the Audit tab.
- `basiclaw://audit?type=lease` — Audit tab with `type` passed to the embed query string.

Test from terminal (simulator):

```bash
xcrun simctl openurl booted "basiclaw://audit?type=lease"
```

## Branding

Tokens live in `constants/Colors.ts` (oxblood `#5c1424`, parchment `#f4e9d8`, ink `#0f0a12`). Inter is loaded via `@expo-google-fonts/inter`.

### Icons and splash

- App icon / adaptive icon / splash: `assets/images/*.png`
- **1024×1024** master for store listings: `assets/images/icon-1024.png` (resized from the template icon — replace with final art before submission)

## Push notifications (stub)

`expo-notifications` is configured. Settings → “Request permission & capture token” stores the Expo push token in AsyncStorage for a future server workflow. Run **`eas init`** (or `eas build:configure`) so Expo can inject **`expo.extra.eas.projectId`** into `app.json`; without it, `getExpoPushTokenAsync` may fail on physical devices — expected until EAS is wired.

## Voice

- **TTS:** `expo-speech` sample in Settings.
- **STT:** Rely on the **WebView** chat embed where the OS/browser exposes speech APIs on supported versions (documented here by design — no duplicate native STT in this pass).

## Privacy & terms

`app.json` does not duplicate legal copy; the in-app Settings links open:

- `https://basiclaw.app/privacy`
- `https://basiclaw.app/terms`

## EAS Build (not run in CI)

`eas.json` defines `development`, `preview`, and `production` profiles. This repository **does not** run Expo builds in GitHub Actions (credentials + queue time).

```bash
cd mobile
eas login
eas build:configure   # if first time — updates project id in app.json
eas build --platform ios --profile production
eas build --platform android --profile production
```

## App Store submission checklist

- [ ] Replace placeholder icons/splash with final brand assets (including `icon-1024.png`).
- [ ] Set real `ios.bundleIdentifier` / `android.package` if you ship under a different id than `app.basiclaw.mobile`.
- [ ] Set **EAS project id** in `app.json` → `expo.extra.eas.projectId`.
- [ ] App Store screenshots (6.7", 6.5", 5.5" as required).
- [ ] Metadata: subtitle, keywords, promotional text, support URL, marketing URL.
- [ ] **Privacy Nutrition Labels** (data collection matches embed + Clerk browser flows).
- [ ] Sign in with Apple / account deletion policy if you add native auth later.
- [ ] Age rating questionnaire.
- [ ] Export compliance (encryption) declaration.

## Play Store submission checklist

- [ ] Final adaptive icon + feature graphic.
- [ ] Short / full description, screenshots (phone + 7" tablet if required).
- [ ] Data safety form (align with WebView + analytics in embedded site).
- [ ] Content rating questionnaire.
- [ ] Target API level meets Play requirements for your ship date.

## Jurisdictions data

`assets/jurisdictions.json` is generated from the web app country catalog (checked in for offline Library tab). Regenerate when the web catalog changes (see repo script or `docs/ship-readiness.md` if documented there).

## Troubleshooting

- **Blank WebView:** confirm device/simulator has network; embed URLs are public (`https://basiclaw.app/embed/...`).
- **Push token errors:** configure EAS `projectId` and use a dev client or production build with the notifications entitlement.
