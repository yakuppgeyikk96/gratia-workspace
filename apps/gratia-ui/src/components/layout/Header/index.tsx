import { Divider } from "@gratia/ui/components";
import BottomHeader from "./BottomHeader";
import styles from "./Header.module.scss";
import MainHeader from "./MainHeader";
import TopHeader from "./TopHeader";

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header(props: HeaderProps) {
  return (
    <div className={styles.header}>
      <TopHeader />
      <Divider />
      <MainHeader isLoggedIn={props.isLoggedIn} />
      <BottomHeader />
      <Divider />
    </div>
  );
}
