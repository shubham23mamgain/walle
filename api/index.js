import axios from "axios";

const API_BASE = "https://vimorawalls-backend.vercel.app/api/v1";
const WALLPAPERS_PATH = "/wallpapers";
const CATEGORIES_PATH = "/categories";
const WALLPAPER_TYPES_PATH = "/wallpaper-types";
const SCREEN_TYPES_PATH = "/screen-types";
const COLORS_PATH = "/colors";

const formatUrl = (path, params) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== "") {
        searchParams.set(key, key === "q" ? value : String(value));
      }
    });
  }
  const query = searchParams.toString();
  const base = `${API_BASE}${path}`;
  return query ? `${base}?${query}` : base;
};

/**
 * Normalize backend wallpaper to app shape (id, webformatURL for grid/card).
 * Backend: _id, image: { url }, title, ...
 */
const normalizeWallpaper = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id ?? item.id,
    webformatURL: item.image?.url ?? item.webformatURL,
    imageHeight: item.imageHeight ?? null,
    imageWidth: item.imageWidth ?? null,
  };
};

/**
 * Fetch wallpapers with filters. Params: page, limit, search/q, sort (latest|popular),
 * wallpaperType (id), screenType (id), mainCategory (id), subCategory (id), dominantColor (hex).
 */
export const apiCall = async (params) => {
  try {
    const apiParams = { ...params };
    if (apiParams.q) {
      apiParams.search = apiParams.q;
      delete apiParams.q;
    }
    if (apiParams.order) {
      apiParams.sort = apiParams.order;
      delete apiParams.order;
    }
    if (apiParams.color) {
      apiParams.dominantColor = apiParams.color;
      delete apiParams.color;
    }
    const response = await axios.get(formatUrl(WALLPAPERS_PATH, apiParams));
    const resData = response.data;
    const list = resData?.data ?? [];
    const normalized = list.map(normalizeWallpaper).filter(Boolean);
    return {
      success: true,
      data: {
        data: normalized,
        hits: normalized,
        total: resData?.total ?? normalized.length,
        pages: resData?.pages ?? 1,
      },
    };
  } catch (err) {
    console.log("Got Error", err.message);
    return { success: false, msg: err.message };
  }
};

/**
 * Fetches categories. Use mainCategory id for filtering wallpapers.
 */
export const fetchCategories = async () => {
  try {
    const response = await axios.get(
      formatUrl(CATEGORIES_PATH, { all: true })
    );
    const resData = response.data;
    const list = resData?.categories ?? [];
    return { success: true, data: list };
  } catch (err) {
    console.log("Got Error (categories)", err.message);
    return { success: false, msg: err.message, data: [] };
  }
};

/**
 * Fetches wallpaper types for filter. Returns { _id, name, slug }.
 */
export const fetchWallpaperTypes = async () => {
  try {
    const response = await axios.get(
      formatUrl(WALLPAPER_TYPES_PATH, { all: true })
    );
    const resData = response.data;
    const list = resData?.types ?? [];
    return { success: true, data: list };
  } catch (err) {
    console.log("Got Error (wallpaper types)", err.message);
    return { success: false, msg: err.message, data: [] };
  }
};

/**
 * Fetches screen types for filter. Returns { _id, name, slug }.
 */
export const fetchScreenTypes = async () => {
  try {
    const response = await axios.get(
      formatUrl(SCREEN_TYPES_PATH, { all: true })
    );
    const resData = response.data;
    const list = resData?.screens ?? [];
    return { success: true, data: list };
  } catch (err) {
    console.log("Got Error (screen types)", err.message);
    return { success: false, msg: err.message, data: [] };
  }
};

/**
 * Fetches colors for filter. Returns { _id, name, hexCode }.
 */
export const fetchColors = async () => {
  try {
    const response = await axios.get(formatUrl(COLORS_PATH, { limit: 100 }));
    const resData = response.data;
    const list = resData?.data ?? [];
    return { success: true, data: list };
  } catch (err) {
    console.log("Got Error (colors)", err.message);
    return { success: false, msg: err.message, data: [] };
  }
};
