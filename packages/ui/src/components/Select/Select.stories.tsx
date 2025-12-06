import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import type { SelectOption } from "./index";
import Select from "./index";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Select component allows users to choose from a list of options. Built using Radix UI Select primitive. Can be used as a form item and integrated with react-hook-form. Supports search functionality for filtering options.",
      },
    },
  },
  argTypes: {
    items: {
      control: { type: "object" },
      description: "Select options (label: ReactNode, value: string)",
    },
    value: {
      control: { type: "text" },
      description: "Selected value (controlled)",
    },
    defaultValue: {
      control: { type: "text" },
      description: "Default selected value (uncontrolled)",
    },
    onValueChange: {
      action: "value changed",
      description: "Callback called when value changes",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Is select disabled?",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Select size",
    },
    variant: {
      control: { type: "select" },
      options: ["filled", "outlined"],
      description: "Select appearance style",
    },
    error: {
      control: { type: "boolean" },
      description: "Error state",
    },
    name: {
      control: { type: "text" },
      description: "Form field name (for react-hook-form)",
    },
    searchable: {
      control: { type: "boolean" },
      description: "Enable search functionality",
    },
    searchPlaceholder: {
      control: { type: "text" },
      description: "Placeholder text for search input",
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
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
  },
};

export const WithDefaultValue: Story = {
  args: {
    items: basicItems,
    defaultValue: "banana",
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
  },
};

export const Small: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "sm",
    variant: "filled",
  },
};

export const Medium: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
  },
};

export const Large: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "lg",
    variant: "filled",
  },
};

export const Filled: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
  },
};

export const Outlined: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "outlined",
  },
};

export const WithError: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "outlined",
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
    disabled: true,
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    items: basicItems,
    placeholder: "Please choose an option...",
    size: "md",
    variant: "filled",
  },
};

const itemsWithIcons: SelectOption[] = [
  { label: "🍎 Apple", value: "apple" },
  { label: "🍌 Banana", value: "banana" },
  { label: "🍊 Orange", value: "orange" },
  { label: "🍇 Grape", value: "grape" },
];

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons,
    placeholder: "Select a fruit",
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
    placeholder: "Select a fruit",
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
      <Select
        items={basicItems}
        placeholder="Small size"
        size="sm"
        variant="filled"
      />
      <Select
        items={basicItems}
        placeholder="Medium size"
        size="md"
        variant="filled"
      />
      <Select
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
      <Select
        items={basicItems}
        placeholder="Filled variant"
        size="md"
        variant="filled"
      />
      <Select
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
      <Select
        items={basicItems}
        placeholder="Normal state"
        size="md"
        variant="outlined"
      />
      <Select
        items={basicItems}
        placeholder="Error state"
        size="md"
        variant="outlined"
        error={true}
      />
      <Select
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
        <Select
          items={basicItems}
          value={value}
          onValueChange={setValue}
          placeholder="Select a fruit"
          size="md"
          variant="filled"
        />
        {value && (
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
            Selected: <strong>{value}</strong>
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

export const WithManyOptions: Story = {
  args: {
    items: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
      { label: "Option 4", value: "4" },
      { label: "Option 5", value: "5" },
      { label: "Option 6", value: "6" },
      { label: "Option 7", value: "7" },
      { label: "Option 8", value: "8" },
      { label: "Option 9", value: "9" },
      { label: "Option 10", value: "10" },
      { label: "Option 11", value: "11" },
      { label: "Option 12", value: "12" },
    ],
    placeholder: "Select an option",
    size: "md",
    variant: "filled",
  },
  parameters: {
    docs: {
      description: {
        story: "Test with many options",
      },
    },
  },
};

// Searchable stories
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

export const Searchable: Story = {
  args: {
    items: manyItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
    searchable: true,
    searchPlaceholder: "Search fruits...",
  },
  parameters: {
    docs: {
      description: {
        story: "Select with search functionality enabled",
      },
    },
  },
};

export const SearchableOutlined: Story = {
  args: {
    items: manyItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "outlined",
    searchable: true,
    searchPlaceholder: "Search fruits...",
  },
  parameters: {
    docs: {
      description: {
        story: "Searchable select with outlined variant",
      },
    },
  },
};

export const SearchableWithReactNodeLabels: Story = {
  args: {
    items: [
      {
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🍎</span>
            <span>Apple</span>
            <span style={{ fontSize: "12px", color: "#666" }}>(Red)</span>
          </div>
        ),
        value: "apple",
        searchText: "Apple Red",
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
        searchText: "Banana Yellow",
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
        searchText: "Orange",
      },
      {
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🍇</span>
            <span>Grape</span>
            <span style={{ fontSize: "12px", color: "#666" }}>(Purple)</span>
          </div>
        ),
        value: "grape",
        searchText: "Grape Purple",
      },
    ],
    placeholder: "Select a fruit",
    size: "md",
    variant: "outlined",
    searchable: true,
    searchPlaceholder: "Search by name or color...",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Searchable select with ReactNode labels using searchText prop for custom search terms",
      },
    },
  },
};

export const SearchableAllSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "300px",
      }}
    >
      <Select
        items={manyItems}
        placeholder="Small size"
        size="sm"
        variant="filled"
        searchable={true}
        searchPlaceholder="Search..."
      />
      <Select
        items={manyItems}
        placeholder="Medium size"
        size="md"
        variant="filled"
        searchable={true}
        searchPlaceholder="Search..."
      />
      <Select
        items={manyItems}
        placeholder="Large size"
        size="lg"
        variant="filled"
        searchable={true}
        searchPlaceholder="Search..."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Searchable select in all sizes",
      },
    },
  },
};

export const SearchableControlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>("");

    return (
      <div style={{ width: "300px" }}>
        <Select
          items={manyItems}
          value={value}
          onValueChange={setValue}
          placeholder="Select a fruit"
          size="md"
          variant="filled"
          searchable={true}
          searchPlaceholder="Search fruits..."
        />
        {value && (
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
            Selected: <strong>{value}</strong>
          </p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Controlled searchable select - search resets when item is selected",
      },
    },
  },
};

export const SearchableWithManyOptions: Story = {
  args: {
    items: manyItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
    searchable: true,
    searchPlaceholder: "Type to search...",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Searchable select with many options - useful for filtering large lists",
      },
    },
  },
};

export const Playground: Story = {
  args: {
    items: basicItems,
    placeholder: "Select a fruit",
    size: "md",
    variant: "filled",
    disabled: false,
    error: false,
    searchable: false,
    searchPlaceholder: "Search...",
  },
  parameters: {
    docs: {
      description: {
        story: "Test the Select component with different values",
      },
    },
  },
};
