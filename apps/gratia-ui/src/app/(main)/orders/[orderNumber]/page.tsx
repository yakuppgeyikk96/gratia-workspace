import { getOrderByNumber } from "@/actions";
import OrderConfirmation from "@/components/features/orders/OrderConfirmation";

interface OrderPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  const response = await getOrderByNumber(orderNumber);
  const order = response.success ? response.data ?? null : null;

  return <OrderConfirmation orderNumber={orderNumber} initialOrder={order} />;
}

