"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import classNames from "classnames";
import IconChevronDown from "../../icons/IconChevronDown";
import styles from "./Collapsible.module.scss";
import type { CollapsibleProps } from "./Collapsible.types";

export default function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  children,
  disabled = false,
  className,
}: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      className={classNames(styles.root, className)}
    >
      <CollapsiblePrimitive.Trigger
        className={styles.trigger}
        disabled={disabled}
      >
        <span className={styles.triggerContent}>{trigger}</span>
        <span className={styles.chevron} aria-hidden>
          <IconChevronDown size={12} color="currentColor" />
        </span>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className={styles.content}>
        <div className={styles.contentInner}>{children}</div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

export type { CollapsibleProps } from "./Collapsible.types";
