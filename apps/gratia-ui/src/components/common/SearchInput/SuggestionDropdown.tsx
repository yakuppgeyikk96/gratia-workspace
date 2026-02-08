import { COLORS } from "@/constants/colors";
import { SearchSuggestion } from "@/types/Product.types";
import IconColumnsGap from "@gratia/ui/icons/IconColumnsGap";
import IconSearch from "@gratia/ui/icons/IconSearch";
import IconShoppingBag from "@gratia/ui/icons/IconShoppingBag";
import styles from "./SearchInput.module.scss";

interface SuggestionDropdownProps {
  suggestions: SearchSuggestion[];
  selectedIndex: number;
  onSelect: (text: string) => void;
  onHover: (index: number) => void;
}

const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
  switch (type) {
    case "brand":
      return <IconShoppingBag color={COLORS.ICON_MUTED} size={16} />;
    case "category":
      return <IconColumnsGap color={COLORS.ICON_MUTED} size={16} />;
    default:
      return <IconSearch color={COLORS.ICON_MUTED} size={16} />;
  }
};

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
          {getSuggestionIcon(suggestion.type)}
          {suggestion.text}
        </div>
      ))}
    </div>
  );
}
