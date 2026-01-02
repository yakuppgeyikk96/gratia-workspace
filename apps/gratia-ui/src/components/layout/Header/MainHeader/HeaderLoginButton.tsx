"use client";

import ProfileDropdown from "@/components/common/ProfileDropdown";
import Button from "@gratia/ui/components/Button";
import IconPerson from "@gratia/ui/icons/IconPerson";
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
