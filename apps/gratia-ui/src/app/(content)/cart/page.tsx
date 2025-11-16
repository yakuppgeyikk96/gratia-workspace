import { isAuthenticatedUser } from "@/actions";
import CartPageContainer from "@/components/layout/CartPageContainer";

export default async function CartPage() {
  const isLoggedIn = await isAuthenticatedUser();

  return <CartPageContainer isLoggedIn={isLoggedIn} />;
}
