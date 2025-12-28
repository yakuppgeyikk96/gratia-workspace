import { Logo, SearchInput } from "@/components/common";
import { Container, Flex } from "@gratia/ui/components";
import HeaderCartButton from "./HeaderCartButton";
import HeaderLoginButton from "./HeaderLoginButton";
import styles from "./MainHeader.module.scss";
import MainHeaderIcons from "./MainHeaderIcons";

interface MainHeaderProps {
  isLoggedIn: boolean;
}

export default function MainHeader(props: MainHeaderProps) {
  return (
    <Container className={styles.mainHeader}>
      {/* Logo */}
      <Logo />

      {/* Search Input */}
      <SearchInput
        className={styles.mainHeaderSearchInput}
        placeholder="Search your favorite products..."
      />

      {/* Desktop Icons (Bell, Heart) - Hidden on tablet */}
      <Flex gap={16} align="center" className={styles.mainHeaderDesktopIcons}>
        <MainHeaderIcons />
      </Flex>

      {/* Primary Actions - Hidden on mobile */}
      <Flex gap={16} align="center" className={styles.mainHeaderPrimaryActions}>
        <HeaderCartButton />
        <HeaderLoginButton isLoggedIn={props.isLoggedIn} />
      </Flex>
    </Container>
  );
}
