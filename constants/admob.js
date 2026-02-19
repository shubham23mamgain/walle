import { Platform } from "react-native";

/**
 * AdMob unit IDs. Use test IDs in development to avoid policy violations.
 * Ad unit IDs use "/" (e.g. ca-app-pub-xxx/1234567890), not app ID "~".
 * Test IDs: https://developers.google.com/admob/android/test-ads#sample_ad_unit_ids
 */

// Set to true only when testing your real banner in dev build. Set back to false before release.
const USE_PROD_ADS_IN_DEV = false;

const TEST_BANNER_ANDROID = "ca-app-pub-3940256099942544/6300978111";
const TEST_BANNER_IOS = "ca-app-pub-3940256099942544/2934735716";

// Production banner ad unit IDs (second set). Android/iOS use "/" for ad unit ID.
const PROD_BANNER_ANDROID = "ca-app-pub-9395722935101852/8731109786";
const PROD_BANNER_IOS = "ca-app-pub-9395722935101852/3223197464";

const useTestIds = __DEV__ && !USE_PROD_ADS_IN_DEV;

export const BANNER_UNIT_ID =
  Platform.OS === "android"
    ? useTestIds
      ? TEST_BANNER_ANDROID
      : PROD_BANNER_ANDROID
    : useTestIds
      ? TEST_BANNER_IOS
      : PROD_BANNER_IOS;
