import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import dynamic from "next/dynamic";

const BottomBar = dynamic(() => import("@/components/layout/BottomBar"), {
  ssr: true,
});

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BottomBar />
    </>
  );
};

export default MainLayout;
