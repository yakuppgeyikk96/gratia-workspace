import HeroCategoryTile from "../HeroCategoryTile";
import styles from "./HeroCategoryGrid.module.scss";

export interface HeroCategoryTileData {
  label: string;
  tagline?: string;
  imageSrc: string;
  href: string;
}

interface HeroCategoryGridProps {
  tiles: HeroCategoryTileData[];
}

export default function HeroCategoryGrid({ tiles }: HeroCategoryGridProps) {
  return (
    <div className={styles.grid}>
      {tiles.map((tile) => (
        <HeroCategoryTile key={tile.href} {...tile} />
      ))}
    </div>
  );
}
