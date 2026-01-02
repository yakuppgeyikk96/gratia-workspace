import type { Metadata } from "next";

import CartInitializer from "@/components/features/cart/CartInitializer";
import { TanstackQueryClientProvider } from "@/components/providers";
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
