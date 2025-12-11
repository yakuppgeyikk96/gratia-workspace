import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import type { SelectOption } from "../Select";
import InputSearch from "./index";

const meta: Meta<typeof InputSearch> = {
  title: "Components/InputSearch",
  component: InputSearch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "InputSearch component allows users to search and select from a list of options. Built with Input component and provides real-time filtering. Can be used as a form item and integrated with react-hook-form.",
      },
    },
  },
  argTypes: {
    items: {
      control: { type: "object" },
      description: "Search options (label: ReactNode, value: string)",
    },
    value: {
      control: { type: "text" },
      description: "Input value (controlled)",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Is input disabled?",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input size",
    },
    variant: {
      control: { type: "select" },
      options: ["filled", "outlined"],
      description: "Input appearance style",
    },
    error: {
      control: { type: "boolean" },
      description: "Error state",
    },
    name: {
      control: { type: "text" },
      description: "Form field name (for react-hook-form)",
    },
    onChange: {
      action: "value changed",
      description: "Callback called when input value changes",
    },
    onSelect: {
      action: "item selected",
      description: "Callback called when an item is selected from the menu",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Grape", value: "grape" },
  { label: "Strawberry", value: "strawberry" },
];

export const Default: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "md",
    variant: "filled",
  },
};

export const Small: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "sm",
    variant: "filled",
  },
};

export const Medium: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "md",
    variant: "filled",
  },
};

export const Large: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "lg",
    variant: "filled",
  },
};

export const Filled: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "md",
    variant: "filled",
  },
};

export const Outlined: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "md",
    variant: "outlined",
  },
};

export const WithError: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "md",
    variant: "outlined",
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "md",
    variant: "filled",
    disabled: true,
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    items: basicItems,
    placeholder: "Type to search for fruits...",
    size: "md",
    variant: "filled",
  },
};

const itemsWithIcons: SelectOption[] = [
  { label: "🍎 Apple", value: "apple" },
  { label: "🍌 Banana", value: "banana" },
  { label: "🍊 Orange", value: "orange" },
  { label: "🍇 Grape", value: "grape" },
  { label: "🍓 Strawberry", value: "strawberry" },
];

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons,
    placeholder: "Search fruits...",
    size: "md",
    variant: "filled",
  },
};

const itemsWithComplexLabels: SelectOption[] = [
  {
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🍎</span>
        <span>Apple</span>
        <span style={{ fontSize: "12px", color: "#666" }}>(Red)</span>
      </div>
    ),
    value: "apple",
  },
  {
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🍌</span>
        <span>Banana</span>
        <span style={{ fontSize: "12px", color: "#666" }}>(Yellow)</span>
      </div>
    ),
    value: "banana",
  },
  {
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🍊</span>
        <span>Orange</span>
        <span style={{ fontSize: "12px", color: "#666" }}>(Orange)</span>
      </div>
    ),
    value: "orange",
  },
];

export const WithComplexLabels: Story = {
  args: {
    items: itemsWithComplexLabels,
    placeholder: "Search fruits...",
    size: "md",
    variant: "outlined",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "300px",
      }}
    >
      <InputSearch
        items={basicItems}
        placeholder="Small size"
        size="sm"
        variant="filled"
      />
      <InputSearch
        items={basicItems}
        placeholder="Medium size"
        size="md"
        variant="filled"
      />
      <InputSearch
        items={basicItems}
        placeholder="Large size"
        size="lg"
        variant="filled"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparison of all sizes",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "300px",
      }}
    >
      <InputSearch
        items={basicItems}
        placeholder="Filled variant"
        size="md"
        variant="filled"
      />
      <InputSearch
        items={basicItems}
        placeholder="Outlined variant"
        size="md"
        variant="outlined"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparison of all variants",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "300px",
      }}
    >
      <InputSearch
        items={basicItems}
        placeholder="Normal state"
        size="md"
        variant="outlined"
      />
      <InputSearch
        items={basicItems}
        placeholder="Error state"
        size="md"
        variant="outlined"
        error={true}
      />
      <InputSearch
        items={basicItems}
        placeholder="Disabled state"
        size="md"
        variant="outlined"
        disabled={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparison of different states",
      },
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>("");

    return (
      <div style={{ width: "300px" }}>
        <InputSearch
          items={basicItems}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search fruits..."
          size="md"
          variant="filled"
        />
        {value && (
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
            Current value: <strong>{value}</strong>
          </p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Controlled component example - value is managed by state",
      },
    },
  },
};

export const WithOnSelect: Story = {
  render: () => {
    const [selectedItem, setSelectedItem] = useState<SelectOption | null>(null);

    return (
      <div style={{ width: "300px" }}>
        <InputSearch
          items={basicItems}
          placeholder="Search fruits..."
          size="md"
          variant="filled"
          onSelect={(value, item) => {
            setSelectedItem(item);
            console.log("Selected:", value, item);
          }}
        />
        {selectedItem && (
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
            Selected: <strong>{selectedItem.value}</strong>
          </p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Example with onSelect callback to handle item selection",
      },
    },
  },
};

const manyItems: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Apricot", value: "apricot" },
  { label: "Avocado", value: "avocado" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Cherry", value: "cherry" },
  { label: "Grape", value: "grape" },
  { label: "Grapefruit", value: "grapefruit" },
  { label: "Kiwi", value: "kiwi" },
  { label: "Lemon", value: "lemon" },
  { label: "Lime", value: "lime" },
  { label: "Mango", value: "mango" },
  { label: "Orange", value: "orange" },
  { label: "Papaya", value: "papaya" },
  { label: "Peach", value: "peach" },
  { label: "Pear", value: "pear" },
  { label: "Pineapple", value: "pineapple" },
  { label: "Plum", value: "plum" },
  { label: "Raspberry", value: "raspberry" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Watermelon", value: "watermelon" },
];

export const WithManyOptions: Story = {
  args: {
    items: manyItems,
    placeholder: "Type to search...",
    size: "md",
    variant: "filled",
  },
  parameters: {
    docs: {
      description: {
        story: "Test with many options - search filters results in real-time",
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputSearch
        items={manyItems}
        placeholder="Try keyboard navigation..."
        size="md"
        variant="filled"
      />
      <div style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}>
        <p>
          <strong>Keyboard shortcuts:</strong>
        </p>
        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
          <li>Arrow Down: Navigate down</li>
          <li>Arrow Up: Navigate up</li>
          <li>Enter: Select highlighted item</li>
          <li>Escape: Close menu</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates keyboard navigation support",
      },
    },
  },
};

export const Playground: Story = {
  args: {
    items: basicItems,
    placeholder: "Search fruits...",
    size: "md",
    variant: "filled",
    disabled: false,
    error: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Test the InputSearch component with different values",
      },
    },
  },
};
