"use client";

import { Button, IconPerson } from "@gratia/ui";
import { useRouter } from "next/navigation";

export default function MainHeaderButton() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <Button variant="ghost" icon={<IconPerson />} onClick={handleLogin}>
      Login
    </Button>
  );
}
