import type { IUser } from "@/types/User.types";
import type { PaginatedOrders } from "@/types/Order.types";
import ProfileHeader from "../ProfileHeader";
import OrderHistoryList from "../OrderHistoryList";
import styles from "./ProfilePageContent.module.scss";

interface ProfilePageContentProps {
  user: IUser;
  ordersData: PaginatedOrders | null;
}

export default function ProfilePageContent({
  user,
  ordersData,
}: ProfilePageContentProps) {
  return (
    <div className={styles.profilePage}>
      <ProfileHeader user={user} />
      <OrderHistoryList ordersData={ordersData} />
    </div>
  );
}
