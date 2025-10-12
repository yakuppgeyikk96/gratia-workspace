"use client";

import SearchInput from "@/components/features/search/SearchInput";
import { Container, Flex, IconBell, IconButton, IconHeart } from "@gratia/ui";
import HeaderCartButton from "./HeaderCartButton";
import HeaderLoginButton from "./HeaderLoginButton";
import styles from "./MainHeader.module.scss";

export default function MainHeader() {
  return (
    <Container className={styles.mainHeader}>
      <h1 className={styles.mainHeaderLogo}>GRATIA</h1>
      <SearchInput placeholder="Search your favorite products..." />
      <Flex gap={16} align="center">
        <IconButton icon={<IconBell />} onClick={() => {}} ariaLabel="Bell" />
        <IconButton icon={<IconHeart />} onClick={() => {}} ariaLabel="Heart" />
      </Flex>
      <Flex gap={16} align="center">
        <HeaderCartButton />
        <HeaderLoginButton />
      </Flex>
    </Container>
  );
}
