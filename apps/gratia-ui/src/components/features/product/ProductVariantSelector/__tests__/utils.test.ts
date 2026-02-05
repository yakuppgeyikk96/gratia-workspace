import { Product } from "@/types/Product.types";
import { describe, expect, it } from "vitest";
import { getVariantLabel, getVariantValue } from "../utils";

describe("getVariantLabel", () => {
  it("should return 'Size' for size variant type", () => {
    expect(getVariantLabel("size")).toBe("Size");
  });

  it("should return 'Color' for color variant type", () => {
    expect(getVariantLabel("color")).toBe("Color");
  });
});

describe("getVariantValue", () => {
  const createMockProduct = (overrides?: Partial<Product>): Product => ({
    id: 1,
    name: "Test Product",
    slug: "test-product",
    sku: "TEST-001",
    categoryId: 1,
    price: "100",
    discountedPrice: null,
    stock: 10,
    attributes: {},
    images: [],
    productGroupId: "group-1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('when variantType is "size"', () => {
    it("should return empty string when size is not set", () => {
      const product = createMockProduct({
        attributes: {},
      });
      expect(getVariantValue(product, "size")).toBe("");
    });
  });

  describe('when variantType is "color"', () => {
    it("should return capitalized color value", () => {
      const product = createMockProduct({
        attributes: { color: "red" },
      });
      expect(getVariantValue(product, "color")).toBe("Red");
    });

    it("should return empty string when color is not set", () => {
      const product = createMockProduct({
        attributes: {},
      });
      expect(getVariantValue(product, "color")).toBe("");
    });
  });
});
