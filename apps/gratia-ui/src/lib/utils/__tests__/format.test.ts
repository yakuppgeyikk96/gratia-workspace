import { describe, expect, it } from "vitest";
import { formatPrice } from "../format";

describe("formatPrice", () => {
  it("should format USD price correctly", () => {
    expect(formatPrice(100, "USD")).toBe("$100.00");
    expect(formatPrice(1234.56, "USD")).toBe("$1234.56");
  });

  it("should format EUR price correctly", () => {
    expect(formatPrice(100, "EUR")).toBe("€100.00");
    expect(formatPrice(999.99, "EUR")).toBe("€999.99");
  });

  it("should format TRY price correctly", () => {
    expect(formatPrice(1000, "TRY")).toBe("1,000.00 ₺");
    expect(formatPrice(1234567.89, "TRY")).toBe("1,234,567.89 ₺");
  });

  it("should default to USD when currency is not provided", () => {
    expect(formatPrice(100)).toBe("$100.00");
  });

  it("should handle unknown currency by defaulting to USD", () => {
    expect(formatPrice(100, "UNKNOWN")).toBe("$100.00");
  });

  it("should handle zero price", () => {
    expect(formatPrice(0, "USD")).toBe("$0.00");
    expect(formatPrice(0, "TRY")).toBe("0.00 ₺");
  });

  it("should handle decimal prices correctly", () => {
    expect(formatPrice(99.99, "USD")).toBe("$99.99");
    expect(formatPrice(1234.5, "USD")).toBe("$1234.50");
  });
});
