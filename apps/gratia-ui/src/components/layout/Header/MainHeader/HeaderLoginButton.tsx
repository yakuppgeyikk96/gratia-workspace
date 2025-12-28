"use client";

import { ProfileDropdown } from "@/components/common";
import { Button } from "@gratia/ui/components";
import { IconPerson } from "@gratia/ui/icons";
import { useRouter } from "next/navigation";

interface HeaderLoginButtonProps {
  isLoggedIn: boolean;
}

export default function HeaderLoginButton(props: HeaderLoginButtonProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return props.isLoggedIn ? (
    <ProfileDropdown />
  ) : (
    <Button variant="ghost" icon={<IconPerson />} onClick={handleLogin}>
      Login
    </Button>
  );
}
