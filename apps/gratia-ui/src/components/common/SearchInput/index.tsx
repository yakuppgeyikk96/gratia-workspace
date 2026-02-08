"use client";

import { COLORS } from "@/constants/colors";
import Input from "@gratia/ui/components/Input";
import IconSearch from "@gratia/ui/icons/IconSearch";
import styles from "./SearchInput.module.scss";
import SuggestionDropdown from "./SuggestionDropdown";
import useSearchSuggestions from "./useSearchSuggestions";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search your favorite products...",
  className = "",
}: SearchInputProps) {
  const {
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
  } = useSearchSuggestions();

  return (
    <div ref={wrapperRef} className={styles.searchWrapper}>
      <Input
        size="lg"
        startIcon={<IconSearch color={COLORS.ICON_MUTED} />}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={className}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <SuggestionDropdown
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          onSelect={navigateToSearch}
          onHover={setSelectedIndex}
        />
      )}
    </div>
  );
}