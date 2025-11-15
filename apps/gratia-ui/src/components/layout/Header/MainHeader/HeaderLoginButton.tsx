"use client";

import ProfileDropdown from "@/components/common/ProfileDropdown";
import { Button } from "@gratia/ui/components";
import { IconPerson } from "@gratia/ui/icons";
import { useRouter } from "next/navigation";

interface HeaderLoginButtonProps {
  isAuthenticatedUser: boolean;
}

export default function HeaderLoginButton(props: HeaderLoginButtonProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return props.isAuthenticatedUser ? (
    <ProfileDropdown />
  ) : (
    <Button variant="ghost" icon={<IconPerson />} onClick={handleLogin}>
      Login
    </Button>
  );
}
