import Link from "next/link";
import type { IUser } from "@/types/User.types";
import ProfileHeader from "../ProfileHeader";
import styles from "./ProfilePageContent.module.scss";

interface ProfilePageContentProps {
  user: IUser;
}

export default function ProfilePageContent({ user }: ProfilePageContentProps) {
  return (
    <div className={styles.profilePage}>
      <ProfileHeader user={user} />
      <Link href="/profile/orders" className={styles.menuLink}>
        My Orders
      </Link>
    </div>
  );
}