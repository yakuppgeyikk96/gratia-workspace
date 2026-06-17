import Image from "next/image";
import Link from "next/link";
import styles from "./HeroCategoryTile.module.scss";

interface HeroCategoryTileProps {
  label: string;
  tagline?: string;
  imageSrc: string;
  href: string;
  imageAlt?: string;
}

export default function HeroCategoryTile({
  label,
  tagline,
  imageSrc,
  href,
  imageAlt,
}: HeroCategoryTileProps) {
  return (
    <Link href={href} prefetch={false} className={styles.tile}>
      <Image
        src={imageSrc}
        alt={imageAlt ?? label}
        fill
        className={styles.tileImage}
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className={styles.tileOverlay} />
      <div className={styles.tileBody}>
        <span className={styles.tileLabel}>{label}</span>
        {tagline ? <span className={styles.tileTagline}>{tagline}</span> : null}
      </div>
    </Link>
  );
}
