"use client";

import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";
import styles from "./Dropdown.module.scss";
import { DropdownProps } from "./Dropdown.types";
import DropdownTriggerContent, {
  renderDropdownIcon,
} from "./DropdownTriggerContent";

export interface DropdownMenuProps extends DropdownProps {
  defaultOpen?: boolean;
}

/**
 * The Radix-backed dropdown. Loaded on demand by the `Dropdown` shell so Radix
 * stays out of the initial bundle of every page that renders a dropdown.
 */
export default function DropdownMenu({
  options,
  value,
  placeholder,
  disabled = false,
  onValueChange,
  triggerClassName,
  contentClassName,
  icon,
  customTrigger,
  defaultOpen = false,
}: DropdownMenuProps) {
  const triggerClass = classNames(styles.trigger, triggerClassName, {
    [styles.disabled as string]: disabled,
  });

  return (
    <RadixDropdownMenu.Root defaultOpen={defaultOpen}>
      <RadixDropdownMenu.Trigger
        className={!customTrigger ? triggerClass : undefined}
        disabled={disabled}
        asChild={!!customTrigger}
      >
        {customTrigger || (
          <DropdownTriggerContent
            options={options}
            value={value}
            placeholder={placeholder}
            icon={icon}
          />
        )}
      </RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className={classNames(styles.content, contentClassName)}
          sideOffset={5}
        >
          {options.map((option) => (
            <RadixDropdownMenu.Item
              key={option.value}
              className={styles.item}
              onSelect={() => onValueChange?.(option.value)}
            >
              {option.icon && renderDropdownIcon(option.icon)}
              <span className={styles.label}>{option.label}</span>
            </RadixDropdownMenu.Item>
          ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}
