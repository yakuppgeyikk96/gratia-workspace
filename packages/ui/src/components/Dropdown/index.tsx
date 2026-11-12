"use client";

import classNames from "classnames";
import { cloneElement, type ComponentType } from "react";
import {
  useDeferredMenu,
  type DeferredMenuTriggerProps,
} from "../../hooks/useDeferredMenu";
import styles from "./Dropdown.module.scss";
import { DropdownOption, DropdownProps } from "./Dropdown.types";
import type { DropdownMenuProps } from "./DropdownMenu";
import DropdownTriggerContent from "./DropdownTriggerContent";

const loadDropdownMenu = (): Promise<ComponentType<DropdownMenuProps>> =>
  import("./DropdownMenu").then((module) => module.default);

type TriggerHandlerName =
  | "onPointerEnter"
  | "onPointerDown"
  | "onClick"
  | "onKeyDown";

const TRIGGER_HANDLER_NAMES: TriggerHandlerName[] = [
  "onPointerEnter",
  "onPointerDown",
  "onClick",
  "onKeyDown",
];

/** Adds our handlers to a custom trigger without dropping its own. */
function mergeTriggerProps(
  ownProps: Record<string, unknown>,
  triggerProps: DeferredMenuTriggerProps,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...triggerProps };

  for (const name of TRIGGER_HANDLER_NAMES) {
    const own = ownProps[name];
    if (typeof own !== "function") continue;

    const ours = triggerProps[name] as (event: unknown) => void;
    merged[name] = (event: unknown): void => {
      own(event);
      ours(event);
    };
  }

  return merged;
}

/**
 * Renders only the trigger until the user interacts with it; the Radix menu
 * (`DropdownMenu`) is loaded on hover/press and mounts already open if the
 * press came first.
 */
export default function Dropdown(props: DropdownProps) {
  const { Menu, openOnLoad, triggerProps } =
    useDeferredMenu<DropdownMenuProps>(loadDropdownMenu);

  if (Menu) {
    return <Menu {...props} defaultOpen={openOnLoad} />;
  }

  const {
    options,
    value,
    placeholder,
    disabled = false,
    triggerClassName,
    icon,
    customTrigger,
  } = props;

  if (customTrigger) {
    return cloneElement(
      customTrigger,
      mergeTriggerProps(customTrigger.props, triggerProps),
    );
  }

  return (
    <button
      type="button"
      className={classNames(styles.trigger, triggerClassName, {
        [styles.disabled as string]: disabled,
      })}
      disabled={disabled}
      {...triggerProps}
    >
      <DropdownTriggerContent
        options={options}
        value={value}
        placeholder={placeholder}
        icon={icon}
      />
    </button>
  );
}

export type { DropdownOption, DropdownProps };
