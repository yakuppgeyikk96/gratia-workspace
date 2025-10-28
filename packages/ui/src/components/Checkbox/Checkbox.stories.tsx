import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import Checkbox from "./index";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Checkbox komponenti kullanıcıların seçim yapmasını sağlar. Form elemanları, onay kutuları ve çoklu seçim durumlarında kullanılır.",
      },
    },
  },
  argTypes: {
    checked: {
      control: { type: "boolean" },
      description: "Checkbox seçili durumu (controlled)",
    },
    defaultChecked: {
      control: { type: "boolean" },
      description: "Checkbox başlangıç seçili durumu (uncontrolled)",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Checkbox devre dışı durumu",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Checkbox boyutu",
    },
    label: {
      control: { type: "text" },
      description: "Checkbox etiketi",
    },
    error: {
      control: { type: "boolean" },
      description: "Hata durumu",
    },
    className: {
      control: { type: "text" },
      description: "Ek CSS sınıfları",
    },
    name: {
      control: { type: "text" },
      description: "Form elemanı adı",
    },
    value: {
      control: { type: "text" },
      description: "Form elemanı değeri",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    label: "Default checkbox",
    size: "md",
    disabled: false,
    error: false,
  },
};

// Size variations
export const Small: Story = {
  args: {
    label: "Small checkbox",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    label: "Medium checkbox",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    label: "Large checkbox",
    size: "lg",
  },
};

// States
export const Checked: Story = {
  args: {
    label: "Checked checkbox",
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    label: "Unchecked checkbox",
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled checkbox",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled checked checkbox",
    disabled: true,
    checked: true,
  },
};

export const Error: Story = {
  args: {
    label: "Error checkbox",
    error: true,
  },
};

export const ErrorChecked: Story = {
  args: {
    label: "Error checked checkbox",
    error: true,
    checked: true,
  },
};

// Without label
export const WithoutLabel: Story = {
  args: {
    size: "md",
  },
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Checkbox label="Small checkbox" size="sm" />
      <Checkbox label="Medium checkbox" size="md" />
      <Checkbox label="Large checkbox" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tüm boyutların karşılaştırması",
      },
    },
  },
};

// All states comparison
export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Checkbox label="Normal" />
      <Checkbox label="Checked" checked />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled Checked" disabled checked />
      <Checkbox label="Error" error />
      <Checkbox label="Error Checked" error checked />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tüm durumların karşılaştırması",
      },
    },
  },
};

// Interactive controlled example
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Checkbox
          label="Controlled checkbox"
          checked={checked}
          onValueChange={setChecked}
        />
        <p>Status: {checked ? "Checked" : "Unchecked"}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Controlled checkbox örneği - state ile yönetim",
      },
    },
  },
};

// Form example
export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      newsletter: false,
      terms: false,
      marketing: true,
    });

    const handleChange = (field: string) => (checked: boolean) => {
      setFormData((prev) => ({ ...prev, [field]: checked }));
    };

    return (
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          minWidth: "300px",
        }}
      >
        <h3>Form Example</h3>

        <Checkbox
          label="I agree to the terms and conditions"
          checked={formData.terms}
          onValueChange={handleChange("terms")}
          error={!formData.terms}
        />

        <Checkbox
          label="Subscribe to newsletter"
          checked={formData.newsletter}
          onValueChange={handleChange("newsletter")}
        />

        <Checkbox
          label="Receive marketing emails"
          checked={formData.marketing}
          onValueChange={handleChange("marketing")}
        />

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <strong>Form Data:</strong>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Gerçek form kullanım örneği",
      },
    },
  },
};

// Multiple checkboxes
export const MultipleCheckboxes: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const items = ["Option 1", "Option 2", "Option 3", "Option 4"];

    const handleItemChange = (item: string) => (checked: boolean) => {
      setSelectedItems((prev) =>
        checked ? [...prev, item] : prev.filter((i) => i !== item)
      );
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: "250px",
        }}
      >
        <h3>Select Multiple Options</h3>

        {items.map((item) => (
          <Checkbox
            key={item}
            label={item}
            checked={selectedItems.includes(item)}
            onValueChange={handleItemChange(item)}
          />
        ))}

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <strong>Selected:</strong> {selectedItems.join(", ") || "None"}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Çoklu seçim örneği",
      },
    },
  },
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    label: "Custom styled checkbox",
    className: "custom-checkbox",
  },
  parameters: {
    docs: {
      description: {
        story: "Özel CSS sınıfı ile stillendirme",
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    label: "Playground checkbox",
    size: "md",
    disabled: false,
    error: false,
    checked: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Checkbox komponentini farklı değerlerle test edin",
      },
    },
  },
};
