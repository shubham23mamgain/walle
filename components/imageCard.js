import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { Image } from "expo-image";
import { getImageSize, wp } from "../helpers/common";
import { theme } from "../constants/theme";

const ImageCard = React.memo(({ item, index, columns, onPress }) => {
  const isLastInRow = (index + 1) % columns === 0;
  const imageHeight = useMemo(() => {
    const { imageHeight: height, imageWidth: width } = item;
    return getImageSize(height, width);
  }, [item?.imageHeight, item?.imageWidth]);

  return (
    <Pressable
      style={[styles.imageWrapper, !isLastInRow && styles.spacing]}
      onPress={() => onPress?.(item)}
    >
      <Image
        style={[styles.image, { height: imageHeight }]}
        source={item?.webformatURL}
        transition={100}
      />
    </Pressable>
  );
});

ImageCard.displayName = "ImageCard";

export default ImageCard;

const styles = StyleSheet.create({
  image: {
    height: 300,
    width: "100%",
  },
  imageWrapper: {
    backgroundColor: theme.colors.grayBG,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    marginBottom: wp(2),
  },
  spacing: {
    marginRight: wp(2),
  },
});
