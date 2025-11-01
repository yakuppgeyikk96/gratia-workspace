import { isAuthenticatedUser } from "@/actions";
import BottomBarItems from "./BottomBarItems";

export default async function BottomBar() {
  const isAuthenticated = await isAuthenticatedUser();

  return <BottomBarItems isAuthenticated={isAuthenticated} />;
}
