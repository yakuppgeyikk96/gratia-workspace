import type { Meta, StoryObj } from "@storybook/react-vite";
import Collapsible from "./index";

const meta: Meta<typeof Collapsible> = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Collapsible shows and hides content with a trigger. Built on Radix UI Collapsible with custom styles.",
      },
    },
  },
  argTypes: {
    defaultOpen: {
      control: { type: "boolean" },
      description: "Initial open state (uncontrolled)",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the trigger",
    },
    trigger: {
      control: { type: "text" },
      description: "Trigger label or content",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  args: {
    trigger: "Click to expand",
    defaultOpen: false,
    children: (
      <p style={{ margin: 0 }}>
        This is the collapsible content. It can contain any React nodes.
      </p>
    ),
  },
};

export const DefaultOpen: Story = {
  args: {
    trigger: "Section title",
    defaultOpen: true,
    children: (
      <p style={{ margin: 0 }}>
        This section is open by default. Click the trigger to collapse.
      </p>
    ),
  },
};

export const WithList: Story = {
  args: {
    trigger: "Filter options",
    defaultOpen: false,
    children: (
      <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
        <li>Option A</li>
        <li>Option B</li>
        <li>Option C</li>
      </ul>
    ),
  },
};

export const Disabled: Story = {
  args: {
    trigger: "Disabled section",
    defaultOpen: false,
    disabled: true,
    children: <p style={{ margin: 0 }}>This content cannot be toggled.</p>,
  },
};
