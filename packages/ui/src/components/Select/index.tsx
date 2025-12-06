"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
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
import { IconChevronDown, IconSearch } from "../../icons";
import styles from "./Select.module.scss";

export interface SelectOption {
  label: ReactNode;
  value: string;
  searchText?: string;
}

export interface SelectProps {
  items: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "filled" | "outlined";
  error?: boolean;
  className?: string;
  name?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
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

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      items,
      value,
      defaultValue,
      onValueChange,
      placeholder = "Select an option",
      disabled = false,
      size = "md",
      variant = "filled",
      error = false,
      className = "",
      name,
      searchable = false,
      searchPlaceholder = "Search...",
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleValueChange = useCallback(
      (newValue: string) => {
        onValueChange?.(newValue);
        onChange?.({
          target: {
            name,
            value: newValue,
          },
        });
        if (searchable) {
          setSearchQuery("");
        }
      },
      [onValueChange, onChange, name, searchable]
    );

    const filteredItems = useMemo(() => {
      if (!searchable || !searchQuery.trim()) {
        return items;
      }

      const query = searchQuery.toLowerCase().trim();

      return items.filter((item) => {
        const searchableText = item.searchText
          ? item.searchText.toLowerCase()
          : extractTextFromNode(item.label).toLowerCase();

        return searchableText.includes(query);
      });
    }, [items, searchQuery, searchable]);

    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        const timeoutId = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }, [isOpen, searchable]);

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      },
      []
    );

    const handleSearchKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
      },
      []
    );

    const handleSearchClick = useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
      },
      []
    );

    const triggerClass = classNames(
      styles.trigger,
      styles[`trigger-${size}`],
      styles[`trigger-${variant}`],
      {
        [styles.triggerError as string]: error,
        [styles.disabled as string]: disabled,
      },
      className
    );

    const contentClass = classNames(styles.content, styles[`content-${size}`]);

    const itemClass = classNames(styles.item, styles[`item-${size}`]);

    const searchInputClass = classNames(
      styles.searchInput,
      styles[`searchInput-${size}`]
    );

    return (
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        name={name}
        onOpenChange={setIsOpen}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          className={triggerClass}
          onBlur={() => {
            onBlur?.({
              target: {
                name,
                value: value || "",
              },
            });
          }}
          {...props}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon
            className={classNames(styles.icon, styles[`icon-${size}`])}
          >
            <IconChevronDown />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={contentClass}
            position="popper"
            side="bottom"
            sideOffset={4}
            align="start"
          >
            {searchable && (
              <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                  <span className={styles.searchIcon}>
                    <IconSearch />
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={searchInputClass}
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onClick={handleSearchClick}
                  />
                </div>
              </div>
            )}

            <SelectPrimitive.Viewport className={styles.viewport}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <SelectPrimitive.Item
                    key={item.value}
                    value={item.value}
                    className={itemClass}
                    disabled={disabled}
                  >
                    <SelectPrimitive.ItemText>
                      {item.label}
                    </SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))
              ) : (
                <div className={styles.noResults}>No results found</div>
              )}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }
);

Select.displayName = "Select";

export default Select;
