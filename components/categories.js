import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import React from "react";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import Animated, { FadeIn } from "react-native-reanimated";

const Categories = ({ categories = [], activeCategory, handleChangeCategory }) => {
  return (
    <FlatList
      data={categories}
      horizontal
      contentContainerStyle={styles.flatlistContainer}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.slug}
      renderItem={({ item, index }) => (
        <CategoryItem
          slug={item.slug}
          name={item.name}
          index={index}
          isActive={activeCategory === item.slug}
          handleChangeCategory={handleChangeCategory}
        />
      )}
    />
  );
};

const CategoryItem = ({ slug, name, isActive, handleChangeCategory, index }) => {
  let color = isActive ? theme.colors.white : theme.colors.neutral(0.8);
  let backgroundColor = isActive
    ? theme.colors.neutral(0.8)
    : theme.colors.white;
  return (
    <Animated.View
      entering={FadeIn.delay(index * 150).duration(1000)}
    >
      <Pressable
        onPress={() => handleChangeCategory(isActive ? null : slug)}
        style={[styles.category, { backgroundColor }]}
      >
        <Text style={[styles.title, { color }]}>{name}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  flatlistContainer: {
    paddingHorizontal: wp(4),
    gap: 8,
  },
  category: {
    padding: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(1.8),
    fontWeight: theme.fontWeights.medium,
  },
});
