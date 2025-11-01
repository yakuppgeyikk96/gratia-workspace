import { isAuthenticatedUser } from "@/actions/auth";
import SearchInput from "@/components/features/search/SearchInput";
import { Container, Flex } from "@gratia/ui/components";
import HeaderCartButton from "./HeaderCartButton";
import HeaderLoginButton from "./HeaderLoginButton";
import styles from "./MainHeader.module.scss";
import MainHeaderIcons from "./MainHeaderIcons";

export default async function MainHeader() {
  const isAuthenticated = await isAuthenticatedUser();

  return (
    <Container className={styles.mainHeader}>
      {/* Logo */}
      <h1 className={styles.mainHeaderLogo}>GRATIA</h1>

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
        <HeaderLoginButton isAuthenticatedUser={isAuthenticated} />
      </Flex>
    </Container>
  );
}
