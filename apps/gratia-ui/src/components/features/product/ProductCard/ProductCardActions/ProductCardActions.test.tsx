import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import ProductCardActions from ".";

import { useCartStore } from "@/store/cartStore";

vi.mock("@/store/cartStore", () => ({
  useCartStore: vi.fn(),
}));

const mockHandleUpdateQuantity = vi.fn();
vi.mock("@/hooks/useCart", () => ({
  useCart: () => ({
    handleUpdateQuantity: mockHandleUpdateQuantity,
  }),
}));

describe("ProductCardActions", () => {
  const mockGetItemCount = vi.fn();
  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useCartStore as unknown as Mock).mockImplementation(
      (
        selector: (state: { getItemCount: (sku: string) => number }) => number
      ) => {
        const state = {
          getItemCount: mockGetItemCount,
        };
        return selector(state);
      }
    );
  });

  describe("Price Display", () => {
    it("should display normal price when no discount", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("$100.00")).toBeInTheDocument();
    });

    it("should display discounted price when there is a discount", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          discountedPrice={80}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("$80.00")).toBeInTheDocument();
    });

    it("should display both discounted and original price when discount exists", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          discountedPrice={80}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      const prices = screen.getAllByText(/\$[\d.]+/);
      expect(prices).toHaveLength(2);
      expect(screen.getByText("$80.00")).toBeInTheDocument();
      expect(screen.getByText("$100.00")).toBeInTheDocument();
    });

    it("should not show discount when discountedPrice is greater than price", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          discountedPrice={120}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("$100.00")).toBeInTheDocument();
      expect(screen.queryByText("$120.00")).not.toBeInTheDocument();
    });
  });

  describe("Cart State", () => {
    it("should show IconButton when item is not in cart", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByLabelText("Add to cart")).toBeInTheDocument();
    });

    it("should show QuantitySelector when item is in cart", () => {
      mockGetItemCount.mockReturnValue(2);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByLabelText("Increment quantity")).toBeInTheDocument();
      expect(screen.getByLabelText("Decrement quantity")).toBeInTheDocument();
    });

    it("should call getItemCount with correct SKU", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(mockGetItemCount).toHaveBeenCalledWith("TEST-001");
    });
  });

  describe("Event Handlers", () => {
    it("should call onAddToCart when IconButton is clicked", async () => {
      const user = userEvent.setup();
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      const addButton = screen.getByLabelText("Add to cart");

      await user.click(addButton);

      expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    });

    it("should not call onAddToCart when onAddToCart prop is not provided", async () => {
      const user = userEvent.setup();
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
        />
      );

      const addButton = screen.getByLabelText("Add to cart");
      await user.click(addButton);

      expect(addButton).toBeInTheDocument();
    });

    it("should call updateQuantity when incrementing", async () => {
      const user = userEvent.setup();
      mockGetItemCount.mockReturnValue(1);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      const incrementButton = screen.getByLabelText("Increment quantity");
      await user.click(incrementButton);

      expect(mockHandleUpdateQuantity).toHaveBeenCalledWith("TEST-001", 2);
    });

    it("should call updateQuantity when decrementing", async () => {
      const user = userEvent.setup();
      mockGetItemCount.mockReturnValue(2);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      const decrementButton = screen.getByLabelText("Decrement quantity");
      await user.click(decrementButton);

      expect(mockHandleUpdateQuantity).toHaveBeenCalledWith("TEST-001", 1);
    });

    it("should pass isLoggedIn flag to updateQuantity", async () => {
      const user = userEvent.setup();
      mockGetItemCount.mockReturnValue(1);

      render(
        <ProductCardActions
          price={100}
          productSku="TEST-001"
          isLoggedIn={true}
          onAddToCart={mockOnAddToCart}
        />
      );

      const incrementButton = screen.getByLabelText("Increment quantity");
      await user.click(incrementButton);

      expect(mockHandleUpdateQuantity).toHaveBeenCalledWith("TEST-001", 2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero price", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={0}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("should handle very large prices", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={999999.99}
          productSku="TEST-001"
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(screen.getByText("$999999.99")).toBeInTheDocument();
    });

    it("should handle empty SKU", () => {
      mockGetItemCount.mockReturnValue(0);

      render(
        <ProductCardActions
          price={100}
          productSku=""
          isLoggedIn={false}
          onAddToCart={mockOnAddToCart}
        />
      );

      expect(mockGetItemCount).toHaveBeenCalledWith("");
    });
  });
});
