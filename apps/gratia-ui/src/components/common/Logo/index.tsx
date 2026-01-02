import Link from "next/link";
import styles from "./Logo.module.scss";

const Logo = () => {
  return (
    <Link href="/" prefetch={false}>
      <h1 className={styles.gratiaLogo}>GRATIA</h1>
    </Link>
  );
};

export default Logo;
