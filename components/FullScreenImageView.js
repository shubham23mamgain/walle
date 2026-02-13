import React, { useCallback, useState } from "react";
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
import { Ionicons, Feather, FontAwesome6 } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import { useLikedImages } from "../context/LikedImagesContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function FullScreenImageView({ visible, image, onClose }) {
  const { isLiked, toggleLike } = useLikedImages();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const liked = image ? isLiked(image.id) : false;

  const handleLike = useCallback(() => {
    if (image) toggleLike(image);
  }, [image, toggleLike]);

  const handleDownload = useCallback(async () => {
    if (!image?.webformatURL) return;
    setDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Allow access to your photo library to save this image."
        );
        return;
      }
      const filename = `vimorawalls_${image.id}.jpg`;
      const path = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.downloadAsync(image.webformatURL, path);
      const asset = await MediaLibrary.createAssetAsync(path);
      const album = await MediaLibrary.getAlbumAsync("VimoraWalls");
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync("VimoraWalls", asset, false);
      }
      Alert.alert("Saved", "Image saved to your gallery.");
    } catch (e) {
      Alert.alert("Error", "Could not save image. Please try again.");
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

        {/* Top bar - glassy close */}
        <View style={styles.topBar}>
          <BlurView intensity={60} tint="dark" style={styles.glassBar}>
            <Pressable onPress={onClose} style={styles.iconButton} hitSlop={12}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
          </BlurView>
        </View>

        {/* Bottom bar - glassy with Heart, Download, Share */}
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
