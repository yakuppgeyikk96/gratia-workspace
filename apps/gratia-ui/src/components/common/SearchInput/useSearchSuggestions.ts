"use client";

import { getSearchSuggestions } from "@/actions/product";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const STALE_TIME = 30_000; // 30s - suggestions stay fresh

export default function useSearchSuggestions() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the query value for TanStack Query
  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setDebouncedQuery("");
      return;
    }

    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch suggestions via TanStack Query
  const { data: suggestions = [] } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      const res = await getSearchSuggestions(debouncedQuery);
      return res?.data?.suggestions ?? [];
    },
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: STALE_TIME,
  });

  // Open dropdown when suggestions arrive
  useEffect(() => {
    if (suggestions.length > 0 && query.trim().length >= MIN_QUERY_LENGTH) {
      setIsOpen(true);
    } else if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setIsOpen(false);
    }
  }, [suggestions, debouncedQuery, query]);

  // Navigate to search results page
  const navigateToSearch = useCallback(
    (text: string) => {
      if (text.trim().length < MIN_QUERY_LENGTH) return;
      setIsOpen(false);
      router.push(`/products/search?q=${encodeURIComponent(text.trim())}`);
    },
    [router]
  );

  // Input change handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === "Enter") navigateToSearch(query);
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          navigateToSearch(selectedIndex >= 0 ? suggestions[selectedIndex].text : query);
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, query, suggestions, selectedIndex, navigateToSearch]
  );

  // Re-open dropdown on focus if suggestions exist
  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) setIsOpen(true);
  }, [suggestions.length]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return {
    query,
    suggestions,
    isOpen,
    selectedIndex,
    wrapperRef,
    handleChange,
    handleKeyDown,
    handleFocus,
    navigateToSearch,
    setSelectedIndex,
  };
}