import CurrencyDropdown from "@/components/common/CurrencyDropdown";
import LanguageDropdown from "@/components/common/LanguageDropdown";
import TopHeaderLinks from "@/components/layout/Header/TopHeaderLinks";
import { COLORS } from "@/constants/colors";
import { Container, Flex } from "@gratia/ui/components";
import { IconInstagram, IconWhatsapp, IconX } from "@gratia/ui/icons";
import styles from "./TopHeader.module.scss";

export default function TopHeader() {
  const socialMediaIconsColor = COLORS.ICON_PRIMARY;

  return (
    <Container className={styles.topHeader}>
      <div className={styles.topHeaderInner}>
        <div className={styles.topHeaderLinks}>
          <Flex gap={12}>
            <IconInstagram color={socialMediaIconsColor} />
            <IconX color={socialMediaIconsColor} />
            <IconWhatsapp color={socialMediaIconsColor} />
          </Flex>
          <TopHeaderLinks />
        </div>
        <Flex gap={4}>
          <CurrencyDropdown />
          <LanguageDropdown />
        </Flex>
      </div>
    </Container>
  );
}
