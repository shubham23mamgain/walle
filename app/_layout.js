import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import {
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LikedImagesProvider } from "../context/LikedImagesContext";

const Layout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LikedImagesProvider>
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home/index" options={{ headerShown: false }} />
            <Stack.Screen name="favorites/index" options={{ headerShown: false }} />
          </Stack>
        </BottomSheetModalProvider>
      </LikedImagesProvider>
    </GestureHandlerRootView>
  );
};

export default Layout;

const styles = StyleSheet.create({});
