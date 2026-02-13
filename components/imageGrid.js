import { StyleSheet, View } from "react-native";
import React, { useCallback } from "react";
import { MasonryFlashList } from "@shopify/flash-list";
import ImageCard from "./imageCard";
import { getColumnCount, hp, wp } from "../helpers/common";

const COLUMNS = getColumnCount();

const ImageGrid = React.memo(
  ({
    images,
    listRef,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached,
    onEndReachedThreshold = 0.5,
    onImagePress,
  }) => {
    const renderItem = useCallback(
      ({ item, index }) => (
        <ImageCard
          item={item}
          index={index}
          columns={COLUMNS}
          onPress={onImagePress}
        />
      ),
      [onImagePress]
    );

    const keyExtractor = useCallback((item) => item?.id?.toString() ?? `${item?.webformatURL}`, []);

    return (
      <View style={styles.container}>
        <MasonryFlashList
          ref={listRef}
          data={images}
          numColumns={COLUMNS}
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContainerStyle}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={200}
        />
      </View>
    );
  }
);

ImageGrid.displayName = "ImageGrid";

export default ImageGrid;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(2),
    width: wp(100),
  },
  listContainerStyle: {
    padding: wp(4),
  },
});
