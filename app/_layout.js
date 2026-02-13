import React from "react";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LikedImagesProvider } from "../context/LikedImagesContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LikedImagesProvider>
        <BottomSheetModalProvider>
          <Slot />
        </BottomSheetModalProvider>
      </LikedImagesProvider>
    </GestureHandlerRootView>
  );
}
