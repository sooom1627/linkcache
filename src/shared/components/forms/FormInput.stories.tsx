import { View } from "react-native";

import { CircleAlert, Mail, Search } from "lucide-react-native";

import { colors } from "@/src/shared/constants/colors";

import type { Meta, StoryObj } from "@storybook/react";

import FormInput from "./FormInput";

const meta: Meta<typeof FormInput> = {
  title: "Components/FormInput",
  component: FormInput,
  decorators: [
    (storyFn) => <View className="p-4">{storyFn()}</View>,
  ],
  args: {
    label: "メールアドレス",
    placeholder: "email@example.com",
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    helperText: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof FormInput>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    label: "メールアドレス",
    error: "無効なメールアドレスです",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "ユーザー名",
    placeholder: "username",
    helperText: "利用可能です",
    helperTextColor: "text-emerald-600",
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: "メールアドレス",
    placeholder: "email@example.com",
    leftIcon: <Mail size={20} color={colors.icon} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: "検索",
    placeholder: "キーワードを入力",
    rightIcon: <Search size={20} color={colors.icon} />,
  },
};

export const WithErrorAndIcon: Story = {
  args: {
    label: "メールアドレス",
    placeholder: "email@example.com",
    error: "入力が必要です",
    leftIcon: <Mail size={20} color={colors.icon} />,
    rightIcon: <CircleAlert size={20} color={colors.error} />,
  },
};
