import { Badge, Button, Flex, IconShoppingBag } from "@gratia/ui";

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
