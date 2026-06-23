"use client";

import Logo from "@/components/common/Logo";
import SearchInput from "@/components/common/SearchInput";
import { useAuthQuery } from "@/hooks/useAuthQuery";
import Container from "@gratia/ui/components/Container";
import Flex from "@gratia/ui/components/Flex";
import HeaderCartButton from "./HeaderCartButton";
import HeaderLoginButton from "./HeaderLoginButton";
import styles from "./MainHeader.module.scss";
import MainHeaderIcons from "./MainHeaderIcons";

export default function MainHeader() {
  const { data: user } = useAuthQuery();
  const isLoggedIn = !!user;

  return (
    <Container className={styles.mainHeader}>
      {/* Logo */}
      <Logo />

      {/* Search Input */}
      <SearchInput
        className={styles.mainHeaderSearchInput}
        placeholder="Search your favorite products..."
      />

      {/* Desktop Icons (Bell, Heart) - Hidden on tablet, hidden for guests */}
      {isLoggedIn && (
        <Flex
          gap={16}
          align="center"
          className={styles.mainHeaderDesktopIcons}
        >
          <MainHeaderIcons isLoggedIn={isLoggedIn} />
        </Flex>
      )}

      {/* Primary Actions - Hidden on mobile */}
      <Flex gap={16} align="center" className={styles.mainHeaderPrimaryActions}>
        <HeaderCartButton />
        <HeaderLoginButton isLoggedIn={isLoggedIn} />
      </Flex>
    </Container>
  );
}
