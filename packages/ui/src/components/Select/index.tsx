"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import classNames from "classnames";
import { forwardRef, ReactNode, useCallback, useMemo } from "react";
import { IconChevronDown } from "../../icons";
import styles from "./Select.module.scss";

export interface SelectOption {
  label: ReactNode;
  value: string;
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
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onBlur?: (event: { target: { name?: string; value: string } }) => void;
}

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
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const handleValueChange = useCallback(
      (newValue: string) => {
        onValueChange?.(newValue);
        onChange?.({
          target: {
            name,
            value: newValue,
          },
        });
      },
      [onValueChange, onChange, name]
    );

    // Get selected item label for aria-label
    const selectedItem = useMemo(() => {
      if (!value) return null;
      return items.find((item) => item.value === value) || null;
    }, [items, value]);

    const ariaLabel = useMemo(() => {
      if (selectedItem) {
        const labelText =
          typeof selectedItem.label === "string"
            ? selectedItem.label
            : placeholder;
        return labelText;
      }
      return placeholder;
    }, [selectedItem, placeholder]);

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

    return (
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        name={name}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          className={triggerClass}
          aria-label={ariaLabel}
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
            <SelectPrimitive.Viewport className={styles.viewport}>
              {items.map((item) => (
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
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }
);

Select.displayName = "Select";

export default Select;
