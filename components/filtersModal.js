import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useImperativeHandle, useState } from "react";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import { ColorFilterView, CommonFilterView, SectionView } from "./filterViews";
import { capitalize } from "lodash";
import { data } from "../constants/data";

const FiltersModal = ({
  modalRef,
  onClose,
  onApply,
  onReset,
  filters,
  setFilters,
}) => {
  const [visible, setVisible] = useState(false);

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

  const { height: windowHeight } = useWindowDimensions();
  const modalHeight = Math.min(windowHeight * 0.75, 600);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <BlurView style={StyleSheet.absoluteFill} tint="dark" intensity={25} />
        </Pressable>
        <View style={[styles.sheet, { height: modalHeight }]}>
          <View style={styles.sheetInner}>
          <View style={styles.content}>
            <Text style={styles.filterText}>Filters</Text>
            {Object.keys(sections).map((sectionName, index) => {
              const sectionView = sections[sectionName];
              const sectionData = data.filters[sectionName];
              const title = capitalize(sectionName);
              return (
                <Animated.View
                  key={sectionName}
                  entering={FadeInDown.delay(index * 100 + 100)
                    .springify()
                    .damping(11)}
                >
                  <SectionView
                    title={title}
                    content={sectionView({
                      data: sectionData,
                      filters,
                      setFilters,
                      filterName: sectionName,
                    })}
                  />
                </Animated.View>
              );
            })}

            <Animated.View
              entering={FadeInDown.delay(800).springify().damping(11)}
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
        </View>
      </View>
    </View>
    </Modal>
  );
};

const sections = {
  order: (props) => <CommonFilterView {...props} />,
  orientation: (props) => <CommonFilterView {...props} />,
  colors: (props) => <ColorFilterView {...props} />,
  type: (props) => <CommonFilterView {...props} />,
};

export default FiltersModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    overflow: "hidden",
  },
  sheetInner: {
    flex: 1,
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
