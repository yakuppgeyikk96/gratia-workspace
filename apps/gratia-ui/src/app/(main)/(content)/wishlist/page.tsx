import WishlistPageContainer from "@/components/features/wishlist/WishlistPageContainer";
import { isAuthenticated } from "@/lib/utils/auth";

export default async function WishlistPage() {
  const isLoggedIn = await isAuthenticated();

  return <WishlistPageContainer isLoggedIn={isLoggedIn} />;
}
