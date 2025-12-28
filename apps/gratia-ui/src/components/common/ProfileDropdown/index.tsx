"use client";

import { logoutUser } from "@/actions/auth";
import { useCartStore } from "@/store/cartStore";
import { Button, Dropdown, DropdownOption, Flex } from "@gratia/ui/components";
import { IconChevronDown, IconPerson } from "@gratia/ui/icons";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function ProfileDropdown() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  const onValueChange = (value: string) => {
    if (value === "profile") {
      router.push("/profile");
    } else if (value === "logout") {
      logoutUser();
      clearCart();
    }
  };

  const profileMenuOptions: DropdownOption[] = useMemo(
    () => [
      {
        label: "Profile",
        value: "profile",
        icon: <IconPerson />,
      },
      {
        label: "Logout",
        value: "logout",
      },
    ],
    []
  );

  return (
    <Dropdown
      options={profileMenuOptions}
      value="profile"
      onValueChange={onValueChange}
      customTrigger={
        <Button variant="ghost" ariaLabel="Profile">
          <Flex align="center" gap={8}>
            <span>Profile</span>
            <IconChevronDown size={12} />
          </Flex>
        </Button>
      }
    />
  );
}
