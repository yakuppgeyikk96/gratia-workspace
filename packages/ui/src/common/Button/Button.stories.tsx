import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "./index";

const meta: Meta<typeof Button> = {
  title: "Common/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outlined", "ghost"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
    size: "md",
  },
};

export const WithIcon: Story = {
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    icon: "🔍",
    iconPosition: "left",
  },
};

export const Loading: Story = {
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    loading: true,
  },
};
