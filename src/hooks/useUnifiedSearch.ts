"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import searchApi, { SearchResult } from "@/lib/api/search.api";

const RECENT_SEARCHES_KEY = "recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function useUnifiedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<"all" | "products" | "categories">("all");
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load recent searches", e);
        }
      }
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Unified search
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["unified-search", debouncedQuery, searchType],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return {
          results: [],
          summary: {
            total: 0,
            products: 0,
            categories: 0,
            query: "",
          },
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      }

      return await searchApi.search({
        query: debouncedQuery,
        page: 1,
        limit: 20,
        type: searchType,
      });
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  // Get autocomplete suggestions
  const { data: suggestions } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { products: [], categories: [] };
      }
      return await searchApi.getSuggestions(debouncedQuery, 5);
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  // Get trending searches
  const { data: trendingSearches } = useQuery({
    queryKey: ["trending-searches"],
    queryFn: () => searchApi.getTrending(),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Add to recent searches
  const addToRecentSearches = useCallback((query: string) => {
    if (!query || query.length < 2) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== query.toLowerCase()
      );
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      if (typeof window !== "undefined") {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }

      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  // Remove single recent search
  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      if (typeof window !== "undefined") {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Separate results by type
  const productResults =
    searchResults?.results.filter((r) => r.type === "product") || [];
  const categoryResults =
    searchResults?.results.filter((r) => r.type === "category") || [];

  return {
    // State
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchType,
    setSearchType,
    
    // Results
    allResults: searchResults?.results || [],
    productResults,
    categoryResults,
    summary: searchResults?.summary || {
      total: 0,
      products: 0,
      categories: 0,
      query: "",
    },
    
    // Suggestions
    suggestions: suggestions || { products: [], categories: [] },
    trendingSearches: trendingSearches || [],
    
    // Loading
    isLoading: isLoading || isFetching,
    
    // Modal
    isSearchOpen,
    setIsSearchOpen,
    
    // Recent searches
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
    removeRecentSearch,
  };
}