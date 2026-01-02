"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";
import { ReactNode } from "react";
import { IconChevronDown } from "../../icons";
import styles from "./Dropdown.module.scss";
import { DropdownOption, DropdownProps } from "./Dropdown.types";

export default function Dropdown({
  options,
  value,
  placeholder = "Select an option",
  disabled = false,
  onValueChange,
  triggerClassName,
  contentClassName,
  icon,
  customTrigger,
}: DropdownProps) {
  const selectedOption = options.find((option) => option.value === value);

  const renderIcon = (icon: string | ReactNode, isString: boolean) => (
    <span className={isString ? styles.iconText : styles.icon}>{icon}</span>
  );

  const triggerContent = customTrigger || (
    <>
      {selectedOption ? (
        <>
          {selectedOption.icon &&
            renderIcon(
              selectedOption.icon,
              typeof selectedOption.icon === "string"
            )}
          <span className={styles.label}>{selectedOption.label}</span>
        </>
      ) : (
        <span className={styles.placeholder}>{placeholder}</span>
      )}
      {icon || <IconChevronDown />}
    </>
  );

  const triggerClass = classNames(styles.trigger, triggerClassName, {
    [styles.disabled as string]: disabled,
  });

  const contentClass = classNames(styles.content, contentClassName);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={!customTrigger ? triggerClass : undefined}
        disabled={disabled}
        asChild={!!customTrigger}
      >
        {triggerContent}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={contentClass} sideOffset={5}>
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              className={styles.item}
              onSelect={() => onValueChange?.(option.value)}
            >
              {option.icon &&
                renderIcon(option.icon, typeof option.icon === "string")}
              <span className={styles.label}>{option.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export type { DropdownOption, DropdownProps };
