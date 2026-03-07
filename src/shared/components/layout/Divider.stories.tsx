import { View } from "react-native";

import type { Meta, StoryObj } from "@storybook/react";

import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  decorators: [(storyFn) => <View className="bg-white p-4">{storyFn()}</View>],
  argTypes: {
    text: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const WithText: Story = {
  args: {
    text: "または",
  },
};

export const WithoutText: Story = {
  args: {
    text: undefined,
  },
};
