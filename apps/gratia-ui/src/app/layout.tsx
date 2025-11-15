import type { Metadata } from "next";
import { Concert_One, Inter } from "next/font/google";

import { isAuthenticatedUser } from "@/actions";
import TanstackQueryClientProvider from "@/components/common/TanstackQueryClientProvider";
import { CartInitializer } from "@/components/features/cart";
import Header from "@/components/layout/Header";
import { ToastContainer, ToastContextProvider } from "@gratia/ui/components";
import { lazy } from "react";
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
  const isLoggedIn = await isAuthenticatedUser();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${concertOne.variable}`}>
        <TanstackQueryClientProvider>
          <ToastContextProvider>
            <Header />
            <main>{children}</main>
            <BottomBar />
            <ToastContainer />
            <CartInitializer isLoggedIn={isLoggedIn} />
          </ToastContextProvider>
        </TanstackQueryClientProvider>
      </body>
    </html>
  );
}
