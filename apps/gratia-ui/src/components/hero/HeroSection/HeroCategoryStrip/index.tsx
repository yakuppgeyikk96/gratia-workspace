import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import styles from "./HeroCategoryStrip.module.scss";

export interface QuickCategory {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface HeroCategoryStripProps {
  categories: QuickCategory[];
}

export default function HeroCategoryStrip({
  categories,
}: HeroCategoryStripProps) {
  return (
    <nav className={styles.strip} aria-label="Quick category navigation">
      <ul className={styles.list}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <li key={cat.href} className={styles.item}>
              <Link href={cat.href} prefetch={false} className={styles.link}>
                <span className={styles.iconWrap}>
                  <Icon className={styles.icon} aria-hidden="true" />
                </span>
                <span className={styles.label}>{cat.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
