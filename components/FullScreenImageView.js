import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Ionicons, Feather, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import { useLikedImages } from "../context/LikedImagesContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DOUBLE_TAP_DELAY_MS = 400;

export default function FullScreenImageView({ visible, image, onClose }) {
  const { isLiked, toggleLike } = useLikedImages();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [settingWallpaper, setSettingWallpaper] = useState(false);
  const [showHeartFeedback, setShowHeartFeedback] = useState(false);
  const lastTapRef = useRef(0);
  const heartFeedbackLikedRef = useRef(false);

  const liked = image ? isLiked(image.id) : false;

  const handleLike = useCallback(() => {
    if (image) toggleLike(image);
  }, [image, toggleLike]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY_MS) {
      lastTapRef.current = 0;
      heartFeedbackLikedRef.current = !liked;
      handleLike();
      setShowHeartFeedback(true);
      setTimeout(() => setShowHeartFeedback(false), 700);
    } else {
      lastTapRef.current = now;
    }
  }, [handleLike, liked]);

  const handleDownload = useCallback(async () => {
    if (!image?.webformatURL) return;
    setDownloading(true);
    try {
      const writeOnly = Platform.OS === "android";
      const { status } = await MediaLibrary.requestPermissionsAsync(writeOnly);
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          Platform.OS === "android"
            ? "Allow saving to your gallery to save this image."
            : "Allow access to your photo library to save this image."
        );
        return;
      }
      const filename = `vimorawalls_${image.id}.jpg`;
      const path = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.downloadAsync(image.webformatURL, path);
      const localUri = path.startsWith("file://") ? path : `file://${path}`;
      if (Platform.OS === "android") {
        await MediaLibrary.saveToLibraryAsync(localUri);
      } else {
        const asset = await MediaLibrary.createAssetAsync(localUri);
        const album = await MediaLibrary.getAlbumAsync("VimoraWalls");
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync("VimoraWalls", asset, false);
        }
      }
      Alert.alert("Saved", "Image saved to your gallery.");
    } catch (e) {
      const message = e?.message || e?.toString?.() || "Unknown error";
      if (__DEV__) console.warn("Save image error:", message, e);
      Alert.alert(
        "Could not save image",
        Platform.OS === "android"
          ? "Make sure the app has permission to save to your gallery, then try again."
          : "Please try again."
      );
    } finally {
      setDownloading(false);
    }
  }, [image]);

  const handleShare = useCallback(async () => {
    if (!image?.webformatURL) return;
    setSharing(true);
    try {
      const filename = `vimorawalls_share_${image.id}.jpg`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.downloadAsync(image.webformatURL, path);
      const localUri = Platform.OS === "android" ? `file://${path}` : path;

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localUri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share wallpaper to Snapchat, WhatsApp, Facebook, Instagram…",
        });
      } else {
        await Share.share({
          message: "Check out this wallpaper from VimoraWalls " + image.webformatURL,
          title: "Share wallpaper",
        });
      }
    } catch (e) {
      if (e.message?.includes("cancel") || e.message?.includes("User did not share")) return;
      Alert.alert("Error", "Could not open share menu. Try again.");
    } finally {
      setSharing(false);
    }
  }, [image]);

  const setWallpaper = useCallback(
    async (type) => {
      if (!image?.webformatURL) return;
      setSettingWallpaper(true);
      try {
        if (Platform.OS === "android") {
          let ManageWallpaper, TYPE;
          try {
            const w = require("react-native-manage-wallpaper");
            ManageWallpaper = w.default;
            TYPE = w.TYPE;
          } catch (_) {
            Alert.alert(
              "Set as wallpaper",
              "Rebuild the app (development build) to use this feature."
            );
            return;
          }
          ManageWallpaper.setWallpaper(
            { uri: image.webformatURL },
            (res) => {
              setSettingWallpaper(false);
              if (res?.status === "success") {
                Alert.alert(
                  "Done",
                  type === "home"
                    ? "Wallpaper set as home screen."
                    : "Wallpaper set as lock screen."
                );
              } else {
                Alert.alert(
                  "Could not set wallpaper",
                  res?.msg || "Something went wrong. Try again."
                );
              }
            },
            type === "home" ? TYPE.HOME : TYPE.LOCK
          );
          return;
        }
        if (Platform.OS === "ios") {
          const filename = `vimorawalls_${image.id}.jpg`;
          const path = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.downloadAsync(image.webformatURL, path);
          const localUri = path.startsWith("file://") ? path : `file://${path}`;
          const { status } = await MediaLibrary.requestPermissionsAsync(false);
          if (status !== "granted") {
            Alert.alert(
              "Permission needed",
              "Allow access to your photo library to save this image, then set it from Settings → Wallpaper."
            );
            return;
          }
          const asset = await MediaLibrary.createAssetAsync(localUri);
          const album = await MediaLibrary.getAlbumAsync("VimoraWalls");
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          } else {
            await MediaLibrary.createAlbumAsync("VimoraWalls", asset, false);
          }
          Alert.alert(
            "Image saved",
            "To set as wallpaper: open the Photos app → select this image → tap Share → 'Use as Wallpaper'."
          );
        }
      } catch (e) {
        const msg = e?.message || e?.toString?.() || "Unknown error";
        if (__DEV__) console.warn("Set wallpaper error:", msg, e);
        Alert.alert("Error", "Could not set wallpaper. Try again.");
      } finally {
        if (Platform.OS !== "android") setSettingWallpaper(false);
      }
    },
    [image]
  );

  const handleSetHomeScreen = useCallback(() => setWallpaper("home"), [setWallpaper]);
  const handleSetLockScreen = useCallback(() => setWallpaper("lock"), [setWallpaper]);

  if (!image) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Image
          source={image.webformatURL}
          style={styles.fullImage}
          contentFit="contain"
        />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleDoubleTap}
          accessible
          accessibilityLabel="Double-tap to like or unlike"
        />
        {showHeartFeedback && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(400).delay(250)}
            style={styles.heartOverlay}
            pointerEvents="none"
          >
            <Ionicons
              name={heartFeedbackLikedRef.current ? "heart" : "heart-outline"}
              size={80}
              color={heartFeedbackLikedRef.current ? "#e74c3c" : "rgba(255,255,255,0.9)"}
            />
          </Animated.View>
        )}

        {/* Top bar - glassy close */}
        <View style={styles.topBar}>
          <BlurView intensity={60} tint="dark" style={styles.glassBar}>
            <Pressable onPress={onClose} style={styles.iconButton} hitSlop={12}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
          </BlurView>
        </View>

        {/* Bottom bar - glassy with Like, Save, Share + Set Home/Lock */}
        <View style={styles.bottomBar}>
          <BlurView intensity={70} tint="dark" style={styles.glassBarBottom}>
            <View style={styles.actions}>
              <Pressable onPress={handleLike} style={styles.actionBtn}>
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={26}
                  color={liked ? "#e74c3c" : "#fff"}
                />
                <Text style={styles.actionLabel}>{liked ? "Liked" : "Like"}</Text>
              </Pressable>

              <Pressable
                onPress={handleDownload}
                style={styles.actionBtn}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="download" size={24} color="#fff" />
                )}
                <Text style={styles.actionLabel}>Save</Text>
              </Pressable>

              <Pressable
                onPress={handleShare}
                style={styles.actionBtn}
                disabled={sharing}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <FontAwesome6 name="share-nodes" size={22} color="#fff" />
                )}
                <Text style={styles.actionLabel}>Share</Text>
              </Pressable>
            </View>
            <View style={styles.actionsRow2}>
              <Pressable
                onPress={handleSetHomeScreen}
                style={styles.actionBtn}
                disabled={settingWallpaper}
              >
                {settingWallpaper ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="cellphone" size={22} color="#fff" />
                )}
                <Text style={styles.actionLabel}>Set as Home Screen</Text>
              </Pressable>
              <Pressable
                onPress={handleSetLockScreen}
                style={styles.actionBtn}
                disabled={settingWallpaper}
              >
                {settingWallpaper ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="lock-outline" size={22} color="#fff" />
                )}
                <Text style={styles.actionLabel}>Set as Lock Screen</Text>
              </Pressable>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.98)",
    justifyContent: "center",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: "absolute",
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: hp(6),
    paddingHorizontal: wp(4),
    alignItems: "flex-end",
  },
  glassBar: {
    overflow: "hidden",
    borderRadius: 24,
    padding: 4,
  },
  iconButton: {
    padding: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: hp(4),
    paddingHorizontal: wp(4),
  },
  glassBarBottom: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionsRow2: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: hp(1.2),
    paddingTop: hp(1.2),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    paddingVertical: 8,
  },
  actionLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 4,
  },
});
