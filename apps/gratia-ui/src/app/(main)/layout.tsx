import Header from "@/components/layout/Header";
import { isAuthenticated } from "@/lib/utils/auth";
import dynamic from "next/dynamic";

const BottomBar = dynamic(() => import("@/components/layout/BottomBar"), {
  ssr: true,
});

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = await isAuthenticated();

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <BottomBar isLoggedIn={isLoggedIn} />
    </>
  );
};

export default MainLayout;
