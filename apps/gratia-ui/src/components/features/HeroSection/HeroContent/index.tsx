import { Button, Flex } from "@gratia/ui/components";
import Link from "next/link";
import styles from "./HeroContent.module.scss";

interface HeroContentProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  ctaVariant?: "primary" | "secondary" | "outlined" | "ghost";
}

export default function HeroContent({
  title,
  description,
  ctaText,
  ctaHref,
  ctaVariant = "primary",
}: HeroContentProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={24}
      className={styles.heroContent}
    >
      <h1 className={styles.heroTitle}>{title}</h1>
      <p className={styles.heroDescription}>{description}</p>
      <Link href={ctaHref}>
        <Button size="lg" variant={ctaVariant}>
          {ctaText}
        </Button>
      </Link>
    </Flex>
  );
}
