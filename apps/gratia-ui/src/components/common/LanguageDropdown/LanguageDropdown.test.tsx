import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import LanguageDropdown from "./index";

// Radix positions the menu with APIs jsdom does not implement.
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

/**
 * Hovers the placeholder trigger and waits until the preloaded Radix trigger
 * has replaced it (Radix gives its trigger an id). Elements must be re-queried
 * afterwards: the placeholder node is gone.
 */
async function hoverUntilMenuIsLoaded(user: UserEvent): Promise<void> {
  await user.hover(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByRole("button")).toHaveAttribute("id"));
}

describe("LanguageDropdown (deferred Radix menu)", () => {
  it("renders only a closed trigger before any interaction", () => {
    render(<LanguageDropdown />);

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens when pressed before the menu has been loaded", async () => {
    render(<LanguageDropdown />);

    fireEvent.pointerDown(screen.getByRole("button"), { button: 0 });

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem").length).toBeGreaterThan(0);
  });

  it("does not open on ctrl+click or a non-primary button", async () => {
    render(<LanguageDropdown />);

    fireEvent.pointerDown(screen.getByRole("button"), { button: 2 });
    fireEvent.pointerDown(screen.getByRole("button"), {
      button: 0,
      ctrlKey: true,
    });

    await vi.dynamicImportSettled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("stays closed when only hovered, then opens on click", async () => {
    const user = userEvent.setup();
    render(<LanguageDropdown />);

    await hoverUntilMenuIsLoaded(user);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("opens from the keyboard", async () => {
    const user = userEvent.setup();
    render(<LanguageDropdown />);

    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("reports the selected value and closes", async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();
    render(<LanguageDropdown onLanguageChange={onLanguageChange} />);

    await hoverUntilMenuIsLoaded(user);
    await user.click(screen.getByRole("button"));
    const [firstItem] = await screen.findAllByRole("menuitem");
    await user.click(firstItem!);

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });
});
