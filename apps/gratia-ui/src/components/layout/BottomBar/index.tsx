"use client";

import { ScreenBreakpoints } from "@/constants/breakpoints";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

interface BottomBarProps {
  isLoggedIn: boolean;
}

const MOBILE_BREAKPOINT = ScreenBreakpoints.Mobile;

const BottomBarItems = dynamic(() => import("./BottomBarItems"), {
  loading: () => null,
  ssr: false,
});

export default function BottomBar(props: BottomBarProps) {
  const [isMobile, setIsMobile] = useState(false);

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

  return <BottomBarItems isLoggedIn={props.isLoggedIn} />;
}
