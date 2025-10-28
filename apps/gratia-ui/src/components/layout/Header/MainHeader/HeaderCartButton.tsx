import { Badge, Button, Flex } from "@gratia/ui/components";
import { IconShoppingBag } from "@gratia/ui/icons";

export default function HeaderCartButton() {
  return (
    <Button variant="ghost" icon={<IconShoppingBag />} ariaLabel="Cart">
      <Flex align="center" gap={8}>
        <span>Cart</span>
        <Badge count={10} size="sm" color="secondary" />
      </Flex>
    </Button>
  );
}
