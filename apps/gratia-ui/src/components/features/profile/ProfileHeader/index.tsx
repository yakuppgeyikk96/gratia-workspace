import type { IUser } from "@/types/User.types";
import styles from "./ProfileHeader.module.scss";

interface ProfileHeaderProps {
  user: IUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.avatar}>
        {user.firstName.charAt(0)}
        {user.lastName.charAt(0)}
      </div>
      <div className={styles.userInfo}>
        <h1 className={styles.name}>
          {user.firstName} {user.lastName}
        </h1>
        <p className={styles.email}>{user.email}</p>
      </div>
    </div>
  );
}
