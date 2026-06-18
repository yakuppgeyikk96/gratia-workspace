import Container from "@gratia/ui/components/Container";
import {
  Facebook,
  Instagram,
  type LucideIcon,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

import styles from "./Footer.module.scss";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "New arrivals", href: "/products/collection/new-arrivals" },
      { label: "Best sellers", href: "/products/collection/best-sellers" },
      { label: "Flash sale", href: "/products/collection/flash-sale" },
    ],
  },
  {
    title: "Customer service",
    links: [
      { label: "Contact us", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Shipping info", href: "#" },
      { label: "Returns & refunds", href: "#" },
      { label: "Track your order", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "#" },
      { label: "Become a vendor", href: "/become-a-vendor" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Cookie policy", href: "#" },
    ],
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "YouTube", href: "#", icon: Youtube },
];

export default function Footer() {
  const year = 2026;

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.brandBlock}>
            <Link href="/" prefetch={false} className={styles.brand}>
              Gratia
            </Link>
            <p className={styles.tagline}>
              Electronics, fashion, home and more — all in one place.
            </p>
          </div>
          <ul className={styles.socials} aria-label="Follow Gratia">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  aria-label={label}
                  className={styles.socialLink}
                >
                  <Icon size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.columns}>
          {COLUMNS.map((col) => (
            <div key={col.title} className={styles.col}>
              <h3 className={styles.colTitle}>{col.title}</h3>
              <ul className={styles.linkList}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className={styles.link}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottomBar}>
          <span className={styles.copyright}>
            © {year} Gratia. All rights reserved.
          </span>
          <span className={styles.paymentInfo}>
            Secure payments powered by Stripe
          </span>
        </div>
      </Container>
    </footer>
  );
}
