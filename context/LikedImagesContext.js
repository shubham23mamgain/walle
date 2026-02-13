import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LIKED_STORAGE_KEY = "@vimorawalls_liked_images";

const LikedImagesContext = createContext(null);

export function LikedImagesProvider({ children }) {
  const [likedImages, setLikedImages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LIKED_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setLikedImages(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {
        console.warn("Failed to load liked images", e);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(likedImages)).catch((e) =>
      console.warn("Failed to save liked images", e)
    );
  }, [likedImages, loaded]);

  const isLiked = useCallback(
    (id) => likedImages.some((img) => String(img.id) === String(id)),
    [likedImages]
  );

  const toggleLike = useCallback((image) => {
    if (!image?.id) return;
    setLikedImages((prev) => {
      const exists = prev.some((img) => String(img.id) === String(image.id));
      if (exists) return prev.filter((img) => String(img.id) !== String(image.id));
      return [...prev, image];
    });
  }, []);

  const addLike = useCallback((image) => {
    if (!image?.id) return;
    setLikedImages((prev) => {
      if (prev.some((img) => String(img.id) === String(image.id))) return prev;
      return [...prev, image];
    });
  }, []);

  const removeLike = useCallback((id) => {
    setLikedImages((prev) => prev.filter((img) => String(img.id) !== String(id)));
  }, []);

  const value = {
    likedImages,
    isLiked,
    toggleLike,
    addLike,
    removeLike,
    loaded,
  };

  return (
    <LikedImagesContext.Provider value={value}>
      {children}
    </LikedImagesContext.Provider>
  );
}

export function useLikedImages() {
  const ctx = useContext(LikedImagesContext);
  if (!ctx) throw new Error("useLikedImages must be used within LikedImagesProvider");
  return ctx;
}
