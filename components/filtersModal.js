import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import React, { useCallback, useImperativeHandle, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import { ColorFilterView, CommonFilterView, IdNameFilterView, SectionView } from "./filterViews";
import { capitalize } from "lodash";
import { data } from "../constants/data";

const FiltersModal = ({
  modalRef,
  onClose,
  onApply,
  onReset,
  filters,
  setFilters,
  filterOptions = {},
}) => {
  const [visible, setVisible] = useState(false);
  const { wallpaperTypes = [], screenTypes = [], colors = [] } = filterOptions;

  useImperativeHandle(modalRef, () => ({
    present: () => setVisible(true),
    close: () => setVisible(false),
  }), []);

  const handleClose = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const handleApply = useCallback(() => {
    onApply?.();
    setVisible(false);
  }, [onApply]);

  const handleReset = useCallback(() => {
    onReset?.();
    setVisible(false);
  }, [onReset]);

  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Large tablets (e.g. Nexus 10): use more screen width and enough height so content fits
  const isLargeTablet = windowWidth >= 800;
  const modalHeight = isLargeTablet
    ? Math.min(windowHeight * 0.72, 660)
    : Math.min(
        Math.max(windowHeight * 0.75, 380),
        Platform.OS === "ios" ? 680 : 700
      );
  const sheetPaddingBottom = Math.max(insets.bottom, hp(2));
  const isLargeScreen = windowWidth >= 768;
  // On large tablets use most of the width; on 7" only use 520px centered
  const sheetWidthStyle = isLargeTablet
    ? { width: "92%", maxWidth: windowWidth * 0.92, alignSelf: "center" }
    : isLargeScreen
      ? null
      : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <BlurView style={StyleSheet.absoluteFill} tint="dark" intensity={25} />
        </Pressable>
        <View
          style={[
            styles.sheet,
            { height: modalHeight },
            isLargeTablet ? sheetWidthStyle : isLargeScreen && styles.sheetLargeScreen,
            isLargeTablet && styles.sheetLargeTablet,
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentScroll,
              { paddingBottom: sheetPaddingBottom },
            ]}
            showsVerticalScrollIndicator={isLargeTablet}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <Text style={styles.filterText}>Filters</Text>
              {Object.keys(sections).map((sectionName, index) => {
                const sectionView = sections[sectionName];
                const sectionData =
                  sectionName === "order"
                    ? data.filters.order
                    : sectionName === "wallpaperType"
                    ? wallpaperTypes
                    : sectionName === "screenType"
                    ? screenTypes
                    : sectionName === "dominantColor"
                    ? colors
                    : [];
                const title =
                  sectionName === "dominantColor" ? "Color" : capitalize(sectionName);
                return (
                  <Animated.View
                    key={sectionName}
                    entering={FadeInDown.delay(index * 50).duration(220)}
                  >
                    <SectionView
                      title={title}
                      content={sectionView({
                        data: sectionData,
                        filters,
                        setFilters,
                        filterName: sectionName,
                        isLargeTablet,
                      })}
                    />
                  </Animated.View>
                );
              })}

              <Animated.View
                entering={FadeInDown.delay(200).duration(220)}
                style={styles.buttons}
              >
                <Pressable style={styles.resetButton} onPress={handleReset}>
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.colors.neutral(0.9) },
                    ]}
                  >
                    Reset
                  </Text>
                </Pressable>

                <Pressable style={styles.applyButton} onPress={handleApply}>
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.colors.white },
                    ]}
                  >
                    Apply
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const sections = {
  order: (props) => <CommonFilterView {...props} />,
  wallpaperType: (props) => <IdNameFilterView {...props} />,
  screenType: (props) => <IdNameFilterView {...props} />,
  dominantColor: (props) => <ColorFilterView {...props} />,
};

export default FiltersModal;

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    overflow: "hidden",
  },
  sheetLargeScreen: {
    alignSelf: "center",
    maxWidth: 520,
    width: "100%",
  },
  sheetLargeTablet: {
    marginBottom: 20,
    maxHeight: "88%",
  },
  scrollView: {
    flex: 1,
  },
  contentScroll: {
    flexGrow: 1,
    paddingTop: hp(1),
  },
  content: {
    gap: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  filterText: {
    fontSize: hp(4),
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral(0.8),
    marginBottom: 5,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: theme.colors.neutral(0.8),
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderCurve: "continuous",
  },
  resetButton: {
    flex: 1,
    backgroundColor: theme.colors.neutral(0.03),
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.grayBG,
    borderCurve: "continuous",
  },
  buttonText: {
    fontSize: hp(2.2),
  },
});
