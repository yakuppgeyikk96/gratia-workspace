import Button from "@gratia/ui/components/Button";
import Flex from "@gratia/ui/components/Flex";
import IconChevronDown from "@gratia/ui/icons/IconChevronDown";
import type { ComponentProps } from "react";

type CategoryDropdownTriggerProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "variant" | "size"
>;

/**
 * The "Categories" button. Shared by the placeholder rendered before the menu
 * is loaded and by the Radix trigger afterwards, so both look identical.
 * Extra props (handlers, aria attributes, ref) are forwarded to the button.
 */
export default function CategoryDropdownTrigger(
  props: CategoryDropdownTriggerProps,
) {
  return (
    <Button variant="ghost" size="sm" {...props}>
      <Flex gap={4} align="center">
        <span>Categories</span>
        <IconChevronDown size={12} />
      </Flex>
    </Button>
  );
}
