# AdMob in Vimora Mobile

## Why no ads in Expo Go?

**Expo Go does not include the AdMob native module.** The app is built to skip ads in Expo Go (so it doesn’t crash). To see ads on your device you must run a **development build** that includes the native AdMob SDK.

## How to see ads on your iPhone

1. **Install Xcode** (Mac only) and connect your iPhone or use the iOS Simulator.
2. **Create a dev build and run on device:**
   ```bash
   cd vimora-mobile
   npx expo prebuild
   npx expo run:ios --device
   ```
   Pick your iPhone when prompted. The first build can take several minutes.
3. The app will install on your iPhone and **test ads** will show at the bottom of the home screen.

**Alternative (no Mac):** Use [EAS Build](https://docs.expo.dev/build/introduction/) to build an iOS development build in the cloud, then install the generated `.ipa` on your iPhone via the link Expo provides.

## Setup

- **Package:** `react-native-google-mobile-ads` (Expo config plugin in `app.json`).
- **App IDs:** In `app.json` under `plugins` → `react-native-google-mobile-ads`. Currently using **Google’s test app IDs** so the app runs without an AdMob account.
- **Banner unit IDs:** In `constants/admob.js`. `__DEV__` uses test unit IDs; production uses `PROD_BANNER_*` (replace with your real IDs from AdMob console).

## Where ads show

- **Home:** One anchored adaptive banner at the bottom of the home screen (`AdMobBanner` in `app/(main)/home/index.js`).

## Going to production

1. Create an AdMob app and get your **Android** and **iOS app IDs** (e.g. `ca-app-pub-xxxxxxxx~xxxxxxxx`).
2. In **app.json**, replace the test plugin config with your app IDs:
   ```json
   ["react-native-google-mobile-ads", {
     "androidAppId": "ca-app-pub-YOUR_ANDROID_APP_ID",
     "iosAppId": "ca-app-pub-YOUR_IOS_APP_ID"
   }]
   ```
3. In **constants/admob.js**, set `PROD_BANNER_ANDROID` and `PROD_BANNER_IOS` to your banner ad unit IDs from the AdMob console.
4. In **Google Play Console**, declare that your app contains ads.
5. Rebuild the native app (`expo prebuild` then build, or EAS Build); the plugin is applied at build time.

## Policy

- Use **test IDs** in development to avoid invalid traffic.
- Keep ad density low (e.g. one banner on home) to stay within policy.
