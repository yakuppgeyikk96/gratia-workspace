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
      <h1 className={styles.mainHeaderLogo}>GRATIA</h1>
      <SearchInput
        className={styles.mainHeaderSearchInput}
        placeholder="Search your favorite products..."
      />
      <Flex gap={16} align="center">
        <MainHeaderIcons />
      </Flex>
      <Flex gap={16} align="center">
        <HeaderCartButton />
        <HeaderLoginButton isAuthenticatedUser={isAuthenticated} />
      </Flex>
    </Container>
  );
}
