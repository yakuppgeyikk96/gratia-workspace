import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Button from "../Button";
import { DrawerItem } from "./Drawer.types";
import Drawer from "./index";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: DrawerItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "🏠",
    onClick: () => console.log("Navigate to home"),
  },
  {
    id: "products",
    label: "Products",
    icon: "🛍️",
    children: [
      {
        id: "products-new",
        label: "New Arrivals",
        onClick: () => console.log("Navigate to new products"),
      },
      {
        id: "products-sale",
        label: "Sale",
        onClick: () => console.log("Navigate to sale"),
      },
      {
        id: "products-categories",
        label: "Categories",
        children: [
          {
            id: "cat-men",
            label: "Men",
            onClick: () => console.log("Navigate to men"),
          },
          {
            id: "cat-women",
            label: "Women",
            onClick: () => console.log("Navigate to women"),
          },
          {
            id: "cat-kids",
            label: "Kids",
            onClick: () => console.log("Navigate to kids"),
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    children: [
      {
        id: "lang",
        label: "Language",
        icon: "🌍",
        onClick: () => alert("Language clicked"),
      },
      {
        id: "currency",
        label: "Currency",
        icon: "💰",
        onClick: () => alert("Currency clicked"),
      },
    ],
  },
  {
    id: "cart",
    label: "Cart",
    icon: "🛒",
    badge: 5,
    onClick: () => console.log("Navigate to cart"),
  },
];

export const LeftDrawer: Story = {
  args: {
    trigger: <Button>Open Left Drawer</Button>,
    items: sampleItems,
    title: "Menu",
    position: "left",
  },
};

export const RightDrawer: Story = {
  args: {
    trigger: <Button>Open Right Drawer</Button>,
    items: sampleItems,
    title: "Menu",
    position: "right",
  },
};

export const WithNestedItems: Story = {
  args: {
    trigger: <Button variant="primary">Open Nested Menu</Button>,
    items: [
      {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        children: [
          {
            id: "account",
            label: "Account",
            children: [
              {
                id: "profile",
                label: "Profile",
                onClick: () => alert("Profile"),
              },
              {
                id: "security",
                label: "Security",
                onClick: () => alert("Security"),
              },
            ],
          },
          {
            id: "preferences",
            label: "Preferences",
            children: [
              {
                id: "notifications",
                label: "Notifications",
                onClick: () => alert("Notifications"),
              },
              {
                id: "privacy",
                label: "Privacy",
                onClick: () => alert("Privacy"),
              },
            ],
          },
        ],
      },
    ],
    title: "Settings",
    position: "right",
  },
};
