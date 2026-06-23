"use client";

import { ScreenBreakpoints } from "@/constants/breakpoints";
import { useAuthQuery } from "@/hooks/useAuthQuery";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = ScreenBreakpoints.Mobile;

const BottomBarItems = dynamic(() => import("./BottomBarItems"), {
  loading: () => null,
  ssr: false,
});

export default function BottomBar() {
  const [isMobile, setIsMobile] = useState(false);
  const { data: user } = useAuthQuery();
  const isLoggedIn = !!user;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!isMobile) {
    return null;
  }

  return <BottomBarItems isLoggedIn={isLoggedIn} />;
}
