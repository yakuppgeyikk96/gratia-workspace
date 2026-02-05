import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserOrders } from "@/actions";
import Container from "@gratia/ui/components/Container";
import type { IUser } from "@/types/User.types";
import ProfilePageContent from "@/components/features/profile/ProfilePageContent";

interface ProfilePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gratia-token")?.value;
  const userCookie = cookieStore.get("gratia-user")?.value;

  if (!token || !userCookie) {
    redirect("/login");
  }

  let user: IUser;
  try {
    user = JSON.parse(userCookie);
  } catch {
    redirect("/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const ordersResponse = await getUserOrders(page, 10);
  const ordersData = ordersResponse.success ? (ordersResponse.data ?? null) : null;

  return (
    <Container>
      <ProfilePageContent user={user} ordersData={ordersData} />
    </Container>
  );
}
