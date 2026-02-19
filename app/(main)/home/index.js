import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/theme";
import { hp, wp } from "../../../helpers/common";
import Categories from "../../../components/categories";
import {
  apiCall,
  fetchCategories,
  fetchWallpaperTypes,
  fetchScreenTypes,
  fetchColors,
} from "../../../api";
import ImageGrid from "../../../components/imageGrid";
import { debounce } from "lodash";
import FiltersModal from "../../../components/filtersModal";
import FullScreenImageView from "../../../components/FullScreenImageView";
import AdMobBanner from "../../../components/AdMobBanner";
import * as WebBrowser from "expo-web-browser";

const PER_PAGE = 25;
const PRIVACY_POLICY_URL = "https://sites.google.com/view/vimorawalls/home";

/** Build API params from filters and active category (slug -> mainCategory id). */
const buildParams = (filters, activeCategorySlug, categories, search, page) => {
  const params = { page, limit: PER_PAGE };
  if (search) params.search = search;
  if (filters?.order) params.sort = filters.order;
  if (filters?.wallpaperType) params.wallpaperType = filters.wallpaperType;
  if (filters?.screenType) params.screenType = filters.screenType;
  if (filters?.dominantColor) params.dominantColor = filters.dominantColor;
  if (activeCategorySlug && categories?.length) {
    const cat = categories.find((c) => c.slug === activeCategorySlug);
    if (cat?._id) params.mainCategory = cat._id;
  }
  return params;
};

const HomeScreen = () => {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const modalRef = useRef(null);
  const listRef = useRef(null);
  const paddingTop = top > 0 ? top + 10 : 30;
  const [activeCategory, setActiveCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState({});
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [noMoreResults, setNoMoreResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    wallpaperTypes: [],
    screenTypes: [],
    colors: [],
  });

  useEffect(() => {
    const params = buildParams(filters, activeCategory, categories, search, 1);
    fetchImages(params, false);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchCategories();
      if (res.success && Array.isArray(res.data)) {
        const parentCategories = res.data
          .filter((cat) => !cat.parentCategory)
          .map((cat) => ({ _id: cat._id, slug: cat.slug, name: cat.name }));
        setCategories(parentCategories);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadFilterOptions = async () => {
      const [wtRes, stRes, cRes] = await Promise.all([
        fetchWallpaperTypes(),
        fetchScreenTypes(),
        fetchColors(),
      ]);
      setFilterOptions({
        wallpaperTypes: wtRes.success ? wtRes.data : [],
        screenTypes: stRes.success ? stRes.data : [],
        colors: (cRes.success ? cRes.data : []).filter((c) => c.isActive !== false),
      });
    };
    loadFilterOptions();
  }, []);

  const fetchImages = useCallback(async (params, append = false, force = false) => {
    if (!force && isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    if (!append) setNoMoreResults(false);
    try {
      const res = await apiCall(params);
      if (res.success && res?.data) {
        const hits = res.data.hits ?? res.data.data ?? [];
        const total = res.data.total ?? 0;
        if (append) {
          setImages((prev) => [...prev, ...hits]);
        } else {
          setImages(hits);
        }
        if (hits.length < (params.limit || PER_PAGE)) {
          setNoMoreResults(true);
        }
      }
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const openFiltersModal = () => {
    modalRef?.current?.present();
  };

  const closeFiltersModal = () => {
    modalRef?.current?.close();
  };

  const applyFilters = () => {
    pageRef.current = 1;
    setImages([]);
    const params = buildParams(filters, activeCategory, categories, search, 1);
    fetchImages(params, false);
    closeFiltersModal();
  };

  const resetFilters = () => {
    pageRef.current = 1;
    setFilters({});
    setImages([]);
    const params = buildParams({}, activeCategory, categories, search, 1);
    fetchImages(params, false);
    closeFiltersModal();
  };

  const clearThisFilter = (filterName) => {
    const filterz = { ...filters };
    delete filterz[filterName];
    setFilters(filterz);
    pageRef.current = 1;
    setImages([]);
    const params = buildParams(filterz, activeCategory, categories, search, 1);
    fetchImages(params, false);
  };

  const handleChangeCategory = (catSlug) => {
    setActiveCategory(catSlug);
    setSearch("");
    setImages([]);
    pageRef.current = 1;
    const params = buildParams(filters, catSlug, categories, search, 1);
    fetchImages(params, false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    pageRef.current = 1;
    setImages([]);
    if (text.length > 2) {
      setActiveCategory(null);
    }
    const params = buildParams(filters, activeCategory, categories, text, 1);
    fetchImages(params, false);
  };

  const handleSearchDebounce = useCallback(debounce(handleSearch, 400), []);

  const onSearchChange = useCallback(
    (text) => {
      setSearch(text);
      handleSearchDebounce(text);
    },
    [handleSearchDebounce]
  );

  const clearSearch = () => {
    setSearch("");
    handleSearch("");
  };

  const handleLoadMore = useCallback(() => {
    if (isLoadingRef.current || noMoreResults) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    const params = buildParams(filters, activeCategory, categories, search, nextPage);
    fetchImages(params, true);
  }, [activeCategory, search, filters, categories, fetchImages, noMoreResults]);

  const getFilterLabel = (key, value) => {
    if (key === "dominantColor") return null;
    if (key === "order") return value;
    if (key === "wallpaperType") {
      const opt = filterOptions.wallpaperTypes.find((t) => (t._id ?? t.id) === value);
      return opt?.name ?? value;
    }
    if (key === "screenType") {
      const opt = filterOptions.screenTypes.find((t) => (t._id ?? t.id) === value);
      return opt?.name ?? value;
    }
    return value;
  };

  const handleScrollUp = useCallback(() => {
    listRef?.current?.scrollToOffset?.({ offset: 0, animated: true });
  }, []);

  const onImagePress = useCallback((item) => setSelectedImage(item), []);

  const openPrivacyPolicy = useCallback(() => {
    WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
  }, []);

  const onRefresh = useCallback(() => {
    pageRef.current = 1;
    setRefreshing(true);
    const params = buildParams(filters, activeCategory, categories, search, 1);
    fetchImages(params, false, true).finally(() => setRefreshing(false));
  }, [fetchImages, filters, activeCategory, categories, search]);

  const listFooterComponent = useCallback(
    () => (
      <View style={[styles.listFooter, images.length > 0 && styles.listFooterWithContent]}>
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : noMoreResults ? (
          <Text style={styles.noMoreResultsText}>
            {images.length > 0 ? "No more results found" : "No results found"}
          </Text>
        ) : null}
      </View>
    ),
    [images.length, isLoading, noMoreResults]
  );

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <Pressable onPress={handleScrollUp}>
          <Text style={styles.title}>VimoraWalls</Text>
        </Pressable>
        <View style={styles.headerIcons}>
          <Pressable onPress={openPrivacyPolicy} style={styles.headerIconBtn}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.neutral(0.7)} />
          </Pressable>
          <Pressable onPress={() => router.push("/favorites")} style={styles.headerIconBtn}>
            <Ionicons name="heart-outline" size={24} color={theme.colors.neutral(0.7)} />
          </Pressable>
          <Pressable onPress={openFiltersModal} style={styles.headerIconBtn}>
            <FontAwesome6
              name="bars-staggered"
              size={22}
              color={theme.colors.neutral(0.7)}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.listHeader}>
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <Feather name="search" size={24} color={theme.colors.neutral(0.4)} />
          </View>
          <TextInput
            placeholder="Search for Photos ..."
            style={styles.searchInput}
            value={search}
            onChangeText={onSearchChange}
          />
          {search ? (
            <Pressable onPress={() => handleSearch("")} style={styles.closeIcon}>
              <Ionicons name="close" size={24} color={theme.colors.neutral(0.6)} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.categories}>
          <Categories
            categories={categories}
            activeCategory={activeCategory}
            handleChangeCategory={handleChangeCategory}
          />
        </View>

        {filters && Object.keys(filters).length > 0 ? (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {Object.keys(filters).map((key) => (
                <View key={key} style={styles.filterItem}>
                  {key === "dominantColor" ? (
                    <View
                      style={{
                        width: 30,
                        height: 20,
                        borderRadius: 7,
                        backgroundColor: filters[key],
                      }}
                    />
                  ) : (
                    <Text style={styles.filterItemText}>
                      {getFilterLabel(key, filters[key]) ?? filters[key]}
                    </Text>
                  )}
                  <Pressable
                    style={styles.filterCloseIcon}
                    onPress={() => clearThisFilter(key)}
                  >
                    <Ionicons
                      name="close"
                      size={14}
                      color={theme.colors.neutral(0.9)}
                    />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <ImageGrid
        images={images}
        listRef={listRef}
        ListFooterComponent={listFooterComponent}
        onEndReached={handleLoadMore}
        onImagePress={onImagePress}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <AdMobBanner />

      <FullScreenImageView
        visible={!!selectedImage}
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <FiltersModal
        modalRef={modalRef}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        onClose={closeFiltersModal}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listHeader: {
    gap: 15,
  },
  listFooter: {
    marginBottom: 70,
    marginTop: 70,
  },
  listFooterWithContent: {
    marginTop: 10,
  },
  noMoreResultsText: {
    fontSize: hp(2.8),
    color: theme.colors.neutral(0.6),
  },
  header: {
    marginHorizontal: wp(8),
    marginBottom: hp(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBtn: {
    padding: 4,
  },
  title: {
    fontSize: hp(4),
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral(0.9),
  },
  searchBar: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: theme.colors.white,
    padding: 6,
    paddingLeft: 10,
    borderColor: theme.colors.grayBG,
    borderRadius: theme.radius.lg,
  },
  searchIcon: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    fontSize: hp(1.8),
  },
  closeIcon: {
    backgroundColor: theme.colors.neutral(0.1),
    borderRadius: theme.radius.sm,
    padding: 8,
  },
  filters: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    gap: 10,
  },
  filterItem: {
    backgroundColor: theme.colors.grayBG,
    padding: 3,
    flexDirection: "row",
    borderRadius: theme.radius.xs,
    gap: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  filterItemText: {
    fontSize: hp(2),
    fontWeight: theme.fontWeights.medium,
  },
  filterCloseIcon: {
    backgroundColor: theme.colors.neutral(0.2),
    padding: 4,
    borderRadius: 7,
  },
});
