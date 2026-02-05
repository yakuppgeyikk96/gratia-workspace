import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserOrders } from "@/actions";
import Container from "@gratia/ui/components/Container";
import OrderHistoryList from "@/components/features/profile/OrderHistoryList";

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gratia-token")?.value;
  const userCookie = cookieStore.get("gratia-user")?.value;

  if (!token || !userCookie) {
    redirect("/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const ordersResponse = await getUserOrders(page, 10);
  const ordersData = ordersResponse.success ? (ordersResponse.data ?? null) : null;

  return (
    <Container>
      <div style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
        <OrderHistoryList ordersData={ordersData} />
      </div>
    </Container>
  );
}