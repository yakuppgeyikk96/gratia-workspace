import { SearchInput } from "@/components/features/search";
import { Container, Flex } from "@gratia/ui/components";
import Link from "next/link";
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
      <Link href="/">
        <h1 className={styles.mainHeaderLogo}>GRATIA</h1>
      </Link>

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
