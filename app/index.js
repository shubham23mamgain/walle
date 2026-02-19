import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hp, wp } from "../helpers/common";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";

const WELCOME_SEEN_KEY = "vimorawalls_hasSeenWelcome";

const WelcomeScreen = () => {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hasRedirected.current) return;
      try {
        const seen = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
        if (cancelled || hasRedirected.current) return;
        if (seen === "true") {
          hasRedirected.current = true;
          router.replace("/(main)/home");
        }
      } catch (_) {}
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleDiscover = async () => {
    try {
      await AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
    } catch (_) {}
    router.push("/(main)/home");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../assets/images/backg.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* linear gradient*/}

      <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.5)",
            "white",
            "white",
          ]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.8 }}
        />

        {/* content*/}
        <View style={styles.contentContainer}>
          <Animated.Text
            entering={FadeInDown.delay(400).springify()}
            style={styles.title}
          >
            VimoraWalls
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(500).springify()}
            style={styles.punchline}
          >
            Every Image Tells a Story
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Pressable
              onPress={handleDiscover}
              style={styles.startButton}
            >
              <Text style={styles.startText}>Discover Now</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    width: wp(100),
    height: hp(100),
    position: "absolute",
  },
  gradient: {
    width: wp(100),
    height: hp(65),
    bottom: 0,
    position: "absolute",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  title: {
    fontSize: hp(7),
    color: theme.colors.neutral(0.9),
    fontWeight: theme.fontWeights.bold,
  },

  punchline: {
    fontSize: hp(2),
    letterSpacing: 1,
    marginBottom: 10,
    color: theme.colors.neutral(0.9),
    fontWeight: theme.fontWeights.medium,
  },

  startButton: {
    marginBottom: 50,
    padding: 15,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.neutral(0.9),
    paddingHorizontal: 90,
  },
  startText: {
    color: theme.colors.white,
    fontSize: hp(3),
    letterSpacing: 1,
    fontWeight: theme.fontWeights.medium,
  },
});
