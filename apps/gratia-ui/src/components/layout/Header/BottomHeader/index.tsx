import { CategoryDropdown } from "@/components/common/Dropdown";
import { Container } from "@gratia/ui";
import HeaderCategoryLinks from "../HeaderCategoryLinks";
import styles from "./BottomHeader.module.scss";

export default function BottomHeader() {
  return (
    <Container className={styles.bottomHeader}>
      <CategoryDropdown triggerClassName={styles.categoryDropdown} />
      <HeaderCategoryLinks />
    </Container>
  );
}
