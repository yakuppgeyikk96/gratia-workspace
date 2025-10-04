"use client";

import SearchInput from "@/components/features/search/SearchInput";
import {
  Badge,
  Button,
  Container,
  Flex,
  IconBell,
  IconButton,
  IconHeart,
  IconShoppingBag,
} from "@gratia/ui";
import styles from "./MainHeader.module.scss";
import MainHeaderButton from "./MainHeaderButton";

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
        <Button variant="ghost" icon={<IconShoppingBag />} ariaLabel="Cart">
          <Flex align="center" gap={8}>
            <span>Cart</span>
            <Badge count={10} size="sm" color="secondary" />
          </Flex>
        </Button>
        <MainHeaderButton />
      </Flex>
    </Container>
  );
}
