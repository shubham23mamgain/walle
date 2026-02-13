import {
  Pressable,
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
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Categories from "../../components/categories";
import { apiCall } from "../../api";
import ImageGrid from "../../components/imageGrid";
import { debounce } from "lodash";
import FiltersModal from "../../components/filtersModal";
import FullScreenImageView from "../../components/FullScreenImageView";

const HomeScreen = () => {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);
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
  const [selectedImage, setSelectedImage] = useState(null);

  const PER_PAGE = 25;

  useEffect(() => {
    fetchImages({ page: 1 }, false);
  }, []);

  const fetchImages = useCallback(async (params = { page: 1 }, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    if (!append) setNoMoreResults(false);
    try {
      const res = await apiCall(params);
      if (res.success && res?.data?.hits) {
        const hits = res.data.hits;
        if (append) {
          setImages((prev) => [...prev, ...hits]);
        } else {
          setImages(hits);
        }
        if (hits.length < PER_PAGE) {
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
    if (filters) {
      pageRef.current = 1;
      setImages([]);
      const params = {
        page: 1,
        ...filters,
      };
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search;
      fetchImages(params, false);
    }
    closeFiltersModal();
  };

  const resetFilters = () => {
    if (filters) {
      pageRef.current = 1;
      setFilters({});
      setImages([]);
      const params = { page: 1 };
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search;
      fetchImages(params, false);
    }
    closeFiltersModal();
  };

  const clearThisFilter = (filterName) => {
    const filterz = { ...filters };
    delete filterz[filterName];
    setFilters(filterz);
    pageRef.current = 1;
    setImages([]);
    const params = { page: 1, ...filterz };
    if (activeCategory) params.category = activeCategory;
    if (search) params.q = search;
    fetchImages(params, false);
  };

  const handleChangeCategory = (cat) => {
    setActiveCategory(cat);
    clearSearch();
    setImages([]);
    pageRef.current = 1;
    const params = { page: 1, ...filters };
    if (cat) params.category = cat;
    fetchImages(params, false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    pageRef.current = 1;
    if (text.length > 2) {
      setImages([]);
      setActiveCategory(null);
      fetchImages({ page: 1, q: text, ...filters }, false);
    }
    if (text === "") {
      searchInputRef?.current?.clear();
      setImages([]);
      setActiveCategory(null);
      fetchImages({ page: 1, ...filters }, false);
    }
  };

  const handleSearchDebounce = useCallback(debounce(handleSearch, 400), []);

  const clearSearch = () => {
    setSearch("");
    searchInputRef?.current?.clear();
  };

  const handleLoadMore = useCallback(() => {
    if (isLoadingRef.current || noMoreResults) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    const params = { page: nextPage, ...filters };
    if (activeCategory) params.category = activeCategory;
    if (search) params.q = search;
    fetchImages(params, true);
  }, [activeCategory, search, filters, fetchImages, noMoreResults]);

  const handleScrollUp = useCallback(() => {
    listRef?.current?.scrollToOffset?.({ offset: 0, animated: true });
  }, []);

  const listHeaderComponent = useCallback(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <Feather
              name="search"
              size={24}
              color={theme.colors.neutral(0.4)}
            />
          </View>
          <TextInput
            placeholder="Search for Photos ..."
            style={styles.searchInput}
            ref={searchInputRef}
            onChangeText={handleSearchDebounce}
          />
          {search ? (
            <Pressable onPress={() => handleSearch("")} style={styles.closeIcon}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.neutral(0.6)}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.categories}>
          <Categories
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
                  {key === "colors" ? (
                    <View
                      style={{
                        width: 30,
                        height: 20,
                        borderRadius: 7,
                        backgroundColor: filters[key],
                      }}
                    />
                  ) : (
                    <Text style={styles.filterItemText}>{filters[key]}</Text>
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
    ),
    [
      search,
      activeCategory,
      filters,
      handleSearchDebounce,
      handleChangeCategory,
      clearThisFilter,
    ]
  );

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

      <ImageGrid
        images={images}
        listRef={listRef}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
        onEndReached={handleLoadMore}
        onImagePress={(item) => setSelectedImage(item)}
      />

      <FullScreenImageView
        visible={!!selectedImage}
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <FiltersModal
        modalRef={modalRef}
        filters={filters}
        setFilters={setFilters}
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
