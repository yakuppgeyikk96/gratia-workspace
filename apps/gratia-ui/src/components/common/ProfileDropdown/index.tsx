"use client";

import { logoutUser } from "@/actions/auth";
import { useCartStore } from "@/store/cartStore";
import { useVendorStatus } from "@/hooks/useVendorStatus";
import Button from "@gratia/ui/components/Button";
import Dropdown, { type DropdownOption } from "@gratia/ui/components/Dropdown";
import Flex from "@gratia/ui/components/Flex";
import IconChevronDown from "@gratia/ui/icons/IconChevronDown";
import IconBox from "@gratia/ui/icons/IconBox";
import IconPerson from "@gratia/ui/icons/IconPerson";
import IconShoppingBag from "@gratia/ui/icons/IconShoppingBag";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function ProfileDropdown() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const setSessionId = useCartStore((state) => state.setSessionId);
  const { isVendor, isLoading } = useVendorStatus();

  const onValueChange = (value: string) => {
    if (value === "profile") {
      router.push("/profile");
    } else if (value === "my-orders") {
      router.push("/profile/orders");
    } else if (value === "become-a-vendor") {
      router.push("/become-a-vendor");
    } else if (value === "vendor-dashboard") {
      router.push("/vendor-dashboard");
    } else if (value === "logout") {
      logoutUser();
      clearCart();
      setSessionId(null);
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
        label: "My Orders",
        value: "my-orders",
        icon: <IconBox />,
      },
      ...(isLoading
        ? []
        : isVendor
          ? [
              {
                label: "Vendor Dashboard",
                value: "vendor-dashboard",
                icon: <IconShoppingBag />,
              },
            ]
          : [
              {
                label: "Become a Vendor",
                value: "become-a-vendor",
                icon: <IconShoppingBag />,
              },
            ]),
      {
        label: "Logout",
        value: "logout",
      },
    ],
    [isVendor, isLoading]
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
