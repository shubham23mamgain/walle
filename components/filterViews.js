import { Pressable, StyleSheet, Text, View } from "react-native";
import { hp } from "../helpers/common";
import { theme } from "../constants/theme";
import { capitalize } from "lodash";

export const SectionView = ({ title, content }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{content}</View>
    </View>
  );
};

/** For static options (e.g. order: ["latest", "popular"]). Value stored as string. */
export const CommonFilterView = ({ data, filterName, filters, setFilters }) => {
  const onSelect = (item) => {
    setFilters({ ...filters, [filterName]: item });
  };
  return (
    <View style={styles.flexRowWrap}>
      {data &&
        data.map((item) => {
          const isActive = filterName && filters[filterName] === item;
          const backgroundColor = isActive ? theme.colors.neutral(0.7) : "white";
          const color = isActive ? "white" : theme.colors.neutral(0.7);
          return (
            <Pressable
              onPress={() => onSelect(item)}
              key={item}
              style={[styles.outlinedButton, { backgroundColor }]}
            >
              <Text style={[styles.outlinedButtonText, { color }]}>
                {capitalize(item)}
              </Text>
            </Pressable>
          );
        })}
    </View>
  );
};

/** For API options with _id and name (e.g. wallpaperType, screenType). Stores _id. */
export const IdNameFilterView = ({ data, filterName, filters, setFilters }) => {
  const onSelect = (id) => {
    setFilters({ ...filters, [filterName]: id });
  };
  if (!data || !Array.isArray(data)) return null;
  return (
    <View style={styles.flexRowWrap}>
      {data.map((item) => {
        const id = item._id ?? item.id;
        const name = item.name ?? id;
        const isActive = filterName && filters[filterName] === id;
        const backgroundColor = isActive ? theme.colors.neutral(0.7) : "white";
        const color = isActive ? "white" : theme.colors.neutral(0.7);
        return (
          <Pressable
            onPress={() => onSelect(id)}
            key={id}
            style={[styles.outlinedButton, { backgroundColor }]}
          >
            <Text style={[styles.outlinedButtonText, { color }]}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

/** For colors from API: { _id, name, hexCode }. Stores hexCode as dominantColor. */
export const ColorFilterView = ({ data, filterName, filters, setFilters }) => {
  const onSelect = (hexCode) => {
    setFilters({ ...filters, [filterName]: hexCode });
  };
  if (!data || !Array.isArray(data)) return null;
  return (
    <View style={styles.flexRowWrap}>
      {data.map((item) => {
        const hex = typeof item === "string" ? item : (item.hexCode ?? item);
        const isActive = filterName && filters[filterName] === hex;
        const borderColor = isActive ? theme.colors.neutral(0.4) : "white";
        return (
          <Pressable onPress={() => onSelect(hex)} key={hex}>
            <View style={[styles.colorWrapper, { borderColor }]}>
              <View style={[styles.color, { backgroundColor: hex }]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral(0.8),
  },
  flexRowWrap: {
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  outlinedButton: {
    padding: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    borderRadius: theme.radius.xs,
    borderCurve: "continuous",
  },
  outlinedButtonText: {},
  colorWrapper: {
    padding: 3,
    borderWidth: 2,
    borderRadius: theme.radius.sm,
  },
  color: {
    height: 30,
    width: 40,
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
  },
});
