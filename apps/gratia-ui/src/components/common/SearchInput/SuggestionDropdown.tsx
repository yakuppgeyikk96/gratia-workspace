import { COLORS } from "@/constants/colors";
import { SearchSuggestion } from "@/types/Product.types";
import IconSearch from "@gratia/ui/icons/IconSearch";
import styles from "./SearchInput.module.scss";

interface SuggestionDropdownProps {
  suggestions: SearchSuggestion[];
  selectedIndex: number;
  onSelect: (text: string) => void;
  onHover: (index: number) => void;
}

export default function SuggestionDropdown({
  suggestions,
  selectedIndex,
  onSelect,
  onHover,
}: SuggestionDropdownProps) {
  return (
    <div className={styles.suggestionsDropdown}>
      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.slug}-${index}`}
          className={`${styles.suggestionItem} ${index === selectedIndex ? styles.selected : ""}`}
          onMouseDown={() => onSelect(suggestion.text)}
          onMouseEnter={() => onHover(index)}
        >
          <IconSearch color={COLORS.ICON_MUTED} size={16} />
          {suggestion.text}
        </div>
      ))}
    </div>
  );
}
