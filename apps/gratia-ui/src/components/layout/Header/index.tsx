import Divider from "@gratia/ui/components/Divider/";
import BottomHeader from "./BottomHeader";
import styles from "./Header.module.scss";
import MainHeader from "./MainHeader";
import TopHeader from "./TopHeader";

export default function Header() {
  return (
    <header className={styles.header}>
      <TopHeader />
      <Divider />
      <MainHeader />
      <BottomHeader />
      <Divider />
    </header>
  );
}
