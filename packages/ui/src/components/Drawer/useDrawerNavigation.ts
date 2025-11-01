import { useCallback, useState } from "react";
import { DrawerItem, DrawerNavigationState } from "./Drawer.types";

export function useDrawerNavigation(
  rootItems: DrawerItem[],
  rootTitle: string
) {
  const [state, setState] = useState<DrawerNavigationState>({
    currentLevel: rootItems,
    history: [],
    title: rootTitle,
  });

  const navigateToChildren = useCallback((item: DrawerItem) => {
    if (!item.children || item.children.length === 0) return;

    setState((prev) => ({
      currentLevel: item.children!,
      history: [...prev.history, prev.currentLevel],
      title: item.label,
    }));
  }, []);

  const navigateBack = useCallback(() => {
    setState((prev) => {
      if (prev.history.length === 0) return prev;

      const newHistory = [...prev.history];
      const previousLevel = newHistory.pop()!;

      return {
        currentLevel: previousLevel,
        history: newHistory,
        title: rootTitle,
      };
    });
  }, [rootTitle]);

  const reset = useCallback(() => {
    setState({
      currentLevel: rootItems,
      history: [],
      title: rootTitle,
    });
  }, [rootItems, rootTitle]);

  return {
    currentLevel: state.currentLevel,
    canGoBack: state.history.length > 0,
    currentTitle: state.title,
    navigateToChildren,
    navigateBack,
    reset,
  };
}
