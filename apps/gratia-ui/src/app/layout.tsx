import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { TanstackQueryClientProvider } from "@/components/providers";
import { CartInitializer } from "@/components/providers/CartProvider";
import { isAuthenticated } from "@/lib/utils/auth";
import {
  ToastContainer,
  ToastContextProvider,
} from "@gratia/ui/components/Toast";

import "./globals.scss";

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
      <body>
        <NextTopLoader
          color="#2563eb"
          height={3}
          showSpinner={false}
          shadow="0 0 8px #2563eb"
        />
        <TanstackQueryClientProvider>
          <ToastContextProvider>
            {children}
            <ToastContainer />
            <CartInitializer isLoggedIn={isLoggedIn} />
          </ToastContextProvider>
        </TanstackQueryClientProvider>
      </body>
    </html>
  );
}
