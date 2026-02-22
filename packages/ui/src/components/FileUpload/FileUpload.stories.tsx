import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import FileUpload from "./index";

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A file upload component with drag & drop support and image previews.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    accept: {
      control: { type: "text" },
      description: "Accepted MIME types (e.g. 'image/*')",
    },
    multiple: {
      control: { type: "boolean" },
      description: "Allow multiple file selection",
    },
    maxFiles: {
      control: { type: "number" },
      description: "Maximum number of files",
    },
    maxSize: {
      control: { type: "number" },
      description: "Maximum file size in bytes",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disable the upload area",
    },
    error: {
      control: { type: "boolean" },
      description: "Show error state",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return <FileUpload value={files} onChange={setFiles} />;
  },
};

export const SingleFile: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return <FileUpload value={files} onChange={setFiles} multiple={false} />;
  },
  parameters: {
    docs: {
      description: { story: "Only allows selecting a single file at a time." },
    },
  },
};

export const ImageOnly: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <FileUpload
        value={files}
        onChange={setFiles}
        accept="image/*"
        maxSize={10 * 1024 * 1024}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Accepts only image files with a 10MB size limit.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: { story: "Disabled state prevents interaction." },
    },
  },
};

export const WithError: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return <FileUpload value={files} onChange={setFiles} error />;
  },
  parameters: {
    docs: {
      description: { story: "Error state with red border." },
    },
  },
};
