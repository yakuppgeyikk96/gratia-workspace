import { getCart } from "@/actions";
import CartList from "@/components/features/Cart/CartList";

export default async function CartPage() {
  const cartResponse = await getCart();

  const cartData = cartResponse.data;

  return (
    <div>
      <CartList cart={cartData ?? null} />
    </div>
  );
}
