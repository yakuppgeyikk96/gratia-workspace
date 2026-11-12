import { ReactNode } from "react";
import IconChevronDown from "../../icons/IconChevronDown";
import styles from "./Dropdown.module.scss";
import { DropdownProps } from "./Dropdown.types";

export function renderDropdownIcon(icon: string | ReactNode): ReactNode {
  return (
    <span className={typeof icon === "string" ? styles.iconText : styles.icon}>
      {icon}
    </span>
  );
}

type DropdownTriggerContentProps = Pick<
  DropdownProps,
  "options" | "value" | "placeholder" | "icon"
>;

/** Contents of the default (non-custom) trigger button. */
export default function DropdownTriggerContent({
  options,
  value,
  placeholder = "Select an option",
  icon,
}: DropdownTriggerContentProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      {selectedOption ? (
        <>
          {selectedOption.icon && renderDropdownIcon(selectedOption.icon)}
          <span className={styles.label}>{selectedOption.label}</span>
        </>
      ) : (
        <span className={styles.placeholder}>{placeholder}</span>
      )}
      {icon || <IconChevronDown />}
    </>
  );
}
