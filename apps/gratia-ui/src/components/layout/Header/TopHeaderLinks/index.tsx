import { TOP_HEADER_LINKS } from "@/constants";
import Flex from "@gratia/ui/components/Flex";
import TopHeaderLinkItem from "./TopHeaderLinkItem";
import styles from "./TopHeaderLinks.module.scss";

export default function TopHeaderLinks() {
  return (
    <Flex as="ul" align="center" gap={12} className={styles.topHeaderLinks}>
      {TOP_HEADER_LINKS.map((link) => (
        <TopHeaderLinkItem
          key={link.href}
          title={link.title}
          href={link.href}
        />
      ))}
    </Flex>
  );
}
