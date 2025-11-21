import type { Metadata } from "next";
import { Concert_One, Inter } from "next/font/google";

import TanstackQueryClientProvider from "@/components/common/TanstackQueryClientProvider";
import CartInitializer from "@/components/features/cart/CartInitializer";
import Header from "@/components/layout/Header";
import { isAuthenticated } from "@/lib/utils/auth";
import { ToastContainer, ToastContextProvider } from "@gratia/ui/components";
import { lazy, Suspense } from "react";
import "./globals.scss";

const BottomBar = lazy(() => import("@/components/layout/BottomBar"));

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const concertOne = Concert_One({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-concert-one",
});

export const metadata: Metadata = {
  title: "Gratia - Your Shopping Destination",
  description: "Discover amazing products at Gratia",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = await isAuthenticated();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${concertOne.variable}`}>
        <TanstackQueryClientProvider>
          <ToastContextProvider>
            <Header isLoggedIn={isLoggedIn} />
            <main>{children}</main>
            <Suspense fallback={null}>
              <BottomBar isLoggedIn={isLoggedIn} />
            </Suspense>
            <ToastContainer />
            <CartInitializer isLoggedIn={isLoggedIn} />
          </ToastContextProvider>
        </TanstackQueryClientProvider>
      </body>
    </html>
  );
}
