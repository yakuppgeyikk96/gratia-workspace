import CategoryTreeDropdown from "./CategoryTreeDropdown";

interface CategoryDropdownProps {
  triggerClassName?: string;
  disabled?: boolean;
}

export default function CategoryDropdown({
  triggerClassName,
  disabled,
}: CategoryDropdownProps) {
  return (
    <CategoryTreeDropdown
      triggerClassName={triggerClassName}
      disabled={disabled}
    />
  );
}
