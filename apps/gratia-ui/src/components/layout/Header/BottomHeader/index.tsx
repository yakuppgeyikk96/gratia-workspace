import { CategoryDropdown } from "@/components/common";
import { Container } from "@gratia/ui/components";
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
