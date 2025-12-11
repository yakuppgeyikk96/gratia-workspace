"use client";

import classNames from "classnames";
import {
  forwardRef,
  isValidElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Input from "../Input";
import type { SelectOption } from "../Select";
import styles from "./InputSearch.module.scss";

export interface InputSearchProps {
  items: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "filled" | "outlined";
  error?: boolean;
  className?: string;
  name?: string;
  onValueChange?: (value: string) => void;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onBlur?: (event: { target: { name?: string; value: string } }) => void;
}

const extractTextFromNode = (node: ReactNode): string => {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).join(" ");
  }
  if (node && isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    if (props.children) {
      return extractTextFromNode(props.children);
    }
  }
  return "";
};

const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(
  (
    {
      items,
      value,
      defaultValue,
      placeholder = "Search...",
      disabled = false,
      size = "md",
      variant = "filled",
      error = false,
      className = "",
      name,
      onValueChange,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Use internal state if value is not provided (uncontrolled mode)
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Find the selected item's label based on current value
    const selectedItem = useMemo(() => {
      if (!currentValue) return null;
      return items.find((item) => item.value === currentValue) || null;
    }, [items, currentValue]);

    // Filter items based on search query
    const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) {
        return [];
      }
      const query = searchQuery.toLowerCase().trim();
      return items.filter((item) => {
        const searchableText = extractTextFromNode(item.label).toLowerCase();
        return searchableText.includes(query);
      });
    }, [items, searchQuery]);

    // Determine if menu should be open
    const isOpen = searchQuery.trim() && filteredItems.length > 0;

    // Display value: show search query if searching, otherwise show selected item label
    const displayValue = searchQuery.trim()
      ? searchQuery
      : selectedItem
        ? extractTextFromNode(selectedItem.label)
        : "";

    const handleValueChange = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
        onChange?.({
          target: {
            name,
            value: newValue,
          },
        });
      },
      [isControlled, onValueChange, onChange, name]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setHighlightedIndex(-1);
      },
      []
    );

    const handleInputFocus = useCallback(() => {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }, []);

    const handleInputBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // Delay to allow click on menu item
        setTimeout(() => {
          if (
            !containerRef.current?.contains(document.activeElement) &&
            !menuRef.current?.contains(document.activeElement)
          ) {
            setSearchQuery("");
            setHighlightedIndex(-1);
            onBlur?.({
              target: {
                name,
                value: currentValue || "",
              },
            });
          }
        }, 200);
      },
      [onBlur, name, currentValue]
    );

    const handleItemClick = useCallback(
      (item: SelectOption) => {
        handleValueChange(item.value);
        setSearchQuery("");
        setHighlightedIndex(-1);
      },
      [handleValueChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || filteredItems.length === 0) {
          return;
        }

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredItems.length - 1 ? prev + 1 : prev
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
          case "Enter":
            e.preventDefault();
            if (
              highlightedIndex >= 0 &&
              highlightedIndex < filteredItems.length
            ) {
              handleItemClick(filteredItems[highlightedIndex] as SelectOption);
            }
            break;
          case "Escape":
            e.preventDefault();
            setSearchQuery("");
            setHighlightedIndex(-1);
            break;
        }
      },
      [isOpen, filteredItems, highlightedIndex, handleItemClick]
    );

    // Reset search query when value changes externally (only in controlled mode)
    useEffect(() => {
      if (isControlled) {
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    }, [currentValue, isControlled]);

    const itemClass = classNames(styles.item, styles[`item-${size}`]);
    const menuClass = classNames(styles.menu, styles[`menu-${size}`]);

    return (
      <div
        ref={containerRef}
        className={classNames(styles.container, className)}
      >
        <Input
          ref={ref}
          size={size}
          variant={variant}
          error={error}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          name={name}
          {...props}
        />
        {isOpen && (
          <div ref={menuRef} className={menuClass}>
            <div className={styles.viewport}>
              {filteredItems.map((item, index) => (
                <div
                  key={item.value}
                  className={classNames(itemClass, {
                    [styles.itemHighlighted as string]:
                      index === highlightedIndex,
                  })}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleItemClick(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}
        {searchQuery.trim() && filteredItems.length === 0 && (
          <div ref={menuRef} className={menuClass}>
            <div className={styles.viewport}>
              <div className={styles.noResults}>No results found</div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

InputSearch.displayName = "InputSearch";

export default InputSearch;
