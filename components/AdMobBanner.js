import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BANNER_UNIT_ID } from "../constants/admob";

// Space for bottom tab bar so the banner sits above it
const BOTTOM_TAB_BAR_HEIGHT = 26;

// Lazy load AdMob; module is only in dev/production builds, not in Expo Go or web
let BannerAd = null;
let BannerAdSize = null;
let admobAvailable = false;
if (Platform.OS !== "web") {
  try {
    const ads = require("react-native-google-mobile-ads");
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    admobAvailable = true;
    ads.default().initialize();
  } catch (_) {
    // Expo Go or missing native module – ads will be no-op
  }
}

/**
 * Renders a single AdMob banner. No-op on web or in Expo Go (needs dev build for real ads).
 */
export default function AdMobBanner() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "web") {
    return null;
  }

  const bottomPadding = insets.bottom + BOTTOM_TAB_BAR_HEIGHT;

  if (!admobAvailable || !BannerAd || !BannerAdSize) {
    if (__DEV__) {
      return (
        <View style={[styles.container, styles.debug, { paddingBottom: bottomPadding }]}>
          <Text style={styles.debugText}>Ads: use a dev build (not Expo Go)</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  debug: {
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
  },
});
