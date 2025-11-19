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

    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    const { container } = render(<ProductCardInfo name="Test Product" />);

    const description = container.querySelector("p");
    expect(description).not.toBeInTheDocument();
  });

  it("should render with empty name", () => {
    render(<ProductCardInfo name="" />);

    const nameElement = screen.getByRole("heading", { level: 3 });
    expect(nameElement).toHaveTextContent("");
  });
});
