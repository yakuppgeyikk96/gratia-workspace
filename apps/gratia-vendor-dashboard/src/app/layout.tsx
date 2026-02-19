import type { Metadata } from "next";

import { TanstackQueryClientProvider } from "@/components/providers";
import {
  ToastContainer,
  ToastContextProvider,
} from "@gratia/ui/components/Toast";

import "./globals.scss";

export const metadata: Metadata = {
  title: "Gratia Vendor Dashboard",
  description: "Manage your Gratia store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TanstackQueryClientProvider>
          <ToastContextProvider>
            {children}
            <ToastContainer />
          </ToastContextProvider>
        </TanstackQueryClientProvider>
      </body>
    </html>
  );
}
