import Container from "@gratia/ui/components/Container";
import {
  Headphones,
  type LucideIcon,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import styles from "./TrustBar.module.scss";

export interface TrustBarItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface TrustBarProps {
  items?: TrustBarItem[];
}

const DEFAULT_ITEMS: TrustBarItem[] = [
  {
    icon: Truck,
    title: "Free shipping",
    description: "On orders over $50",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Encrypted with Stripe",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    description: "30-day money back",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    description: "We're here to help",
  },
];

export default function TrustBar({ items = DEFAULT_ITEMS }: TrustBarProps) {
  return (
    <section className={styles.section} aria-label="Why shop with Gratia">
      <Container className={styles.container}>
        <ul className={styles.list}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className={styles.item}>
                <span className={styles.iconWrap}>
                  <Icon className={styles.icon} aria-hidden="true" />
                </span>
                <div className={styles.text}>
                  <span className={styles.title}>{item.title}</span>
                  <span className={styles.description}>{item.description}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
