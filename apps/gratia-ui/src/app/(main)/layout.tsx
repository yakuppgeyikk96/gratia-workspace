import BottomBar from "@/components/layout/BottomBar";
import Header from "@/components/layout/Header";
import { isAuthenticated } from "@/lib/utils/auth";
import { Suspense } from "react";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = await isAuthenticated();

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <Suspense fallback={null}>
        <BottomBar isLoggedIn={isLoggedIn} />
      </Suspense>
    </>
  );
};

export default MainLayout;
