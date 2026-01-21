import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductCardInfo from "./index";

describe("ProductCardInfo", () => {
  it("should render product name", () => {
    const nameProp = "Test Product";

    render(<ProductCardInfo name={nameProp} />);

    expect(screen.getByText(nameProp)).toBeInTheDocument();
  });

  it("should render product description when provided", () => {
    render(
      <ProductCardInfo
        name="Test Product"
        description="This is a test description"
      />
    );

    expect(screen.getByText(/This is a test description/)).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    render(<ProductCardInfo name="Test Product" />);
    // Description span includes " - " prefix when present
    expect(screen.queryByText(/ - /)).not.toBeInTheDocument();
  });

  it("should render with empty name", () => {
    const { container } = render(<ProductCardInfo name="" />);

    // Still renders the name container even if empty
    const nameSpan = container.querySelector("span");
    expect(nameSpan).toBeInTheDocument();
  });
});
