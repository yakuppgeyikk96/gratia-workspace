import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Badge from "./index";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Badge komponenti sayısal değerleri görsel olarak göstermek için kullanılır. Genellikle bildirim sayısı, sepet içeriği gibi durumlarda kullanılır.",
      },
    },
  },
  argTypes: {
    count: {
      control: { type: "number" },
      description: "Badge içinde gösterilecek sayı",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Badge boyutu",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary"],
      description: "Badge rengi",
    },
    showZero: {
      control: { type: "boolean" },
      description: "Sayı 0 olduğunda badge gösterilsin mi?",
    },
    className: {
      control: { type: "text" },
      description: "Ek CSS sınıfları",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 5,
    size: "md",
    color: "secondary",
    showZero: false,
  },
};

export const Small: Story = {
  args: {
    count: 3,
    size: "sm",
    color: "primary",
  },
};

export const Medium: Story = {
  args: {
    count: 12,
    size: "md",
    color: "secondary",
  },
};

export const Large: Story = {
  args: {
    count: 99,
    size: "lg",
    color: "primary",
  },
};

export const Primary: Story = {
  args: {
    count: 8,
    size: "md",
    color: "primary",
  },
};

export const Secondary: Story = {
  args: {
    count: 15,
    size: "md",
    color: "secondary",
  },
};

export const ZeroCount: Story = {
  args: {
    count: 0,
    size: "md",
    color: "secondary",
    showZero: false,
  },
};

export const ZeroCountVisible: Story = {
  args: {
    count: 0,
    size: "md",
    color: "primary",
    showZero: true,
  },
};

export const HighNumber: Story = {
  args: {
    count: 150,
    size: "md",
    color: "secondary",
  },
};

export const MaxNumber: Story = {
  args: {
    count: 99,
    size: "lg",
    color: "primary",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Badge count={3} size="sm" color="primary" />
      <Badge count={12} size="md" color="primary" />
      <Badge count={99} size="lg" color="primary" />
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

export const AllColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Badge count={5} size="md" color="primary" />
      <Badge count={5} size="md" color="secondary" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparing all color variants",
      },
    },
  },
};

export const NotificationBadge: Story = {
  render: () => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        style={{
          padding: "8px 16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          background: "white",
          cursor: "pointer",
        }}
      >
        Bildirimler
      </button>
      <div style={{ position: "absolute", top: "-8px", right: "-8px" }}>
        <Badge count={3} size="sm" color="primary" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Gerçek kullanım örneği: Bildirim butonu",
      },
    },
  },
};

export const ShoppingCartBadge: Story = {
  render: () => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        style={{
          padding: "8px 16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          background: "white",
          cursor: "pointer",
        }}
      >
        🛒 Sepet
      </button>
      <div style={{ position: "absolute", top: "-8px", right: "-8px" }}>
        <Badge count={7} size="md" color="secondary" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Gerçek kullanım örneği: Sepet butonu",
      },
    },
  },
};

export const Playground: Story = {
  args: {
    count: 42,
    size: "md",
    color: "secondary",
    showZero: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Badge komponentini farklı değerlerle test edin",
      },
    },
  },
};
