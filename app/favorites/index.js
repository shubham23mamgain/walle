import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { useLikedImages } from "../../context/LikedImagesContext";
import ImageGrid from "../../components/imageGrid";
import FullScreenImageView from "../../components/FullScreenImageView";

export default function FavoritesScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { likedImages, loaded } = useLikedImages();
  const [selectedImage, setSelectedImage] = useState(null);
  const paddingTop = top > 0 ? top + 10 : 30;

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.neutral(0.9)} />
        </Pressable>
        <Text style={styles.title}>Liked Images</Text>
        <View style={styles.placeholder} />
      </View>

      {!loaded ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : likedImages.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.neutral(0.4)} />
          <Text style={styles.emptyTitle}>No liked images yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart on any image to save it here
          </Text>
          <Pressable style={styles.discoverBtn} onPress={() => router.back()}>
            <Text style={styles.discoverBtnText}>Discover wallpapers</Text>
          </Pressable>
        </View>
      ) : (
        <ImageGrid
          images={likedImages}
          listRef={null}
          ListHeaderComponent={null}
          ListFooterComponent={null}
          onImagePress={(item) => setSelectedImage(item)}
        />
      )}

      <FullScreenImageView
        visible={!!selectedImage}
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: wp(4),
    marginBottom: hp(2),
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral(0.9),
  },
  placeholder: {
    width: 32,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  emptyTitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral(0.8),
    marginTop: 16,
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.neutral(0.5),
    marginTop: 8,
    textAlign: "center",
  },
  discoverBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.neutral(0.9),
    borderRadius: 12,
  },
  discoverBtnText: {
    color: theme.colors.white,
    fontSize: hp(1.8),
    fontWeight: theme.fontWeights.medium,
  },
});
