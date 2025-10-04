"use client";

import { IconChevronDown } from "@gratia/ui";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from "./Dropdown.module.scss";
import { DropdownProps } from "./types";

export default function BaseDropdown({
  options,
  value,
  placeholder = "Select an option",
  disabled = false,
  triggerClassName = "",
  contentClassName = "",
  icon,
  customTrigger,
  onValueChange,
}: DropdownProps) {
  const selectedOption = options.find((option) => option.value === value);

  const triggerContent = customTrigger || (
    <>
      {selectedOption ? (
        <>
          {selectedOption.icon && (
            <div
              className={
                typeof selectedOption.icon === "string"
                  ? styles.iconText
                  : styles.icon
              }
            >
              {selectedOption.icon}
            </div>
          )}
          <span className={styles.label}>{selectedOption.label}</span>
        </>
      ) : (
        <span className={styles.placeholder}>{placeholder}</span>
      )}
      {icon || <IconChevronDown />}
    </>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={`${styles.trigger} ${triggerClassName}`}
        disabled={disabled}
        asChild={!!customTrigger}
      >
        {triggerContent}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`${styles.content} ${contentClassName}`}
          sideOffset={5}
        >
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              className={styles.item}
              onSelect={() => onValueChange?.(option.value)}
            >
              {option.icon && (
                <span className={styles.icon}>
                  {typeof option.icon === "string" ? (
                    <span className={styles.iconText}>{option.icon}</span>
                  ) : (
                    option.icon
                  )}
                </span>
              )}
              <span className={styles.label}>{option.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
