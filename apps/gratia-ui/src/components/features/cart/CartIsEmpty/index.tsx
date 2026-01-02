"use client";

import { COLORS } from "@/constants/colors";
import Button from "@gratia/ui/components/Button/";
import Container from "@gratia/ui/components/Container/";
import Flex from "@gratia/ui/components/Flex/";
import { IconBagXFill } from "@gratia/ui/icons";
import Link from "next/link";
import styles from "./CartIsEmpty.module.scss";

export default function CartIsEmpty() {
  return (
    <Container className={styles.cartIsEmpty}>
      <Flex direction="column" align="center" gap={24}>
        <div className={styles.iconContainer}>
          <IconBagXFill color={COLORS.ICON_MUTED} size={80} />
        </div>

        <Flex direction="column" align="center" gap={12}>
          <h2 className={styles.title}>Your cart is empty</h2>
          <p className={styles.description}>
            Start shopping by exploring our products
          </p>
        </Flex>

        <Link href="/" prefetch={false}>
          <Button variant="primary" size="lg">
            Start Shopping
          </Button>
        </Link>
      </Flex>
    </Container>
  );
}
