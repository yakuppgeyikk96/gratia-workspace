import CartPageContainer from "@/components/layout/CartPageContainer";
import { isAuthenticated } from "@/lib/utils/auth";

export default async function CartPage() {
  const isLoggedIn = await isAuthenticated();

  return <CartPageContainer isLoggedIn={isLoggedIn} />;
}
