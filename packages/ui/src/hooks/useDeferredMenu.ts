"use client";

import {
  useCallback,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

export interface DeferredMenuTriggerProps {
  onPointerEnter: () => void;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": false;
  "data-state": "closed";
}

export interface DeferredMenu<P> {
  /** The loaded menu component, or null while only the trigger is rendered. */
  Menu: ComponentType<P> | null;
  /** True when the user asked to open the menu before it finished loading. */
  openOnLoad: boolean;
  /** Spread onto the placeholder trigger rendered while `Menu` is null. */
  triggerProps: DeferredMenuTriggerProps;
}

/**
 * Keeps a menu implementation (e.g. Radix) out of the initial bundle.
 *
 * Until the user interacts, the caller renders a plain trigger with
 * `triggerProps`. Hovering preloads the menu chunk; pressing the trigger loads
 * it and reports `openOnLoad` so the real menu can mount already open.
 *
 * `load` must be a stable reference (declare it at module scope).
 */
export function useDeferredMenu<P>(
  load: () => Promise<ComponentType<P>>,
): DeferredMenu<P> {
  const [Menu, setMenu] = useState<ComponentType<P> | null>(null);
  const [openOnLoad, setOpenOnLoad] = useState(false);

  const preload = useCallback((): void => {
    load()
      .then((component) => setMenu(() => component))
      .catch((error: unknown) => {
        console.error("Failed to load menu", error);
      });
  }, [load]);

  const open = useCallback((): void => {
    setOpenOnLoad(true);
    preload();
  }, [preload]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>): void => {
      // Mirror Radix: open on primary-button press, not on ctrl+click.
      if (event.button !== 0 || event.ctrlKey) return;

      open();
      // Keep the press from focusing this placeholder. It is about to be
      // replaced by the real trigger, and focus landing outside the freshly
      // opened menu would make Radix dismiss it straight away.
      event.preventDefault();
    },
    [open],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      // Enter and Space reach the trigger as a click; ArrowDown does not.
      if (event.key === "ArrowDown") {
        event.preventDefault();
        open();
      }
    },
    [open],
  );

  return {
    Menu,
    openOnLoad,
    triggerProps: {
      onPointerEnter: preload,
      onPointerDown,
      onClick: open,
      onKeyDown,
      "aria-haspopup": "menu",
      "aria-expanded": false,
      "data-state": "closed",
    },
  };
}
