import CategoryDropdownTree from "./CategoryDropdownTree";

interface CategoryDropdownProps {
  triggerClassName?: string;
  disabled?: boolean;
}

export default function CategoryDropdown({
  triggerClassName,
  disabled,
}: CategoryDropdownProps) {
  return (
    <CategoryDropdownTree
      triggerClassName={triggerClassName}
      disabled={disabled}
    />
  );
}
