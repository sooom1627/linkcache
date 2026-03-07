import { Alert } from "react-native";

import type { Meta, StoryObj } from "@storybook/react";

import FormButton from "./FormButton";

const meta: Meta<typeof FormButton> = {
  title: "Components/FormButton",
  component: FormButton,
  args: {
    title: "送信する",
    disabled: false,
  },
  argTypes: {
    disabled: { control: "boolean" },
    title: { control: "text" },
    enabledColor: { control: "text" },
    disabledColor: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof FormButton>;

export const Default: Story = {
  args: {
    title: "送信する",
    onPress: () => Alert.alert("Pressed"),
  },
};

export const Disabled: Story = {
  args: {
    title: "送信できません",
    disabled: true,
  },
};

export const Danger: Story = {
  args: {
    title: "削除する",
    enabledColor: "bg-danger",
    disabledColor: "bg-dangerDisabled",
    onPress: () => Alert.alert("Delete pressed"),
  },
};

export const DangerDisabled: Story = {
  args: {
    title: "削除できません",
    enabledColor: "bg-danger",
    disabledColor: "bg-dangerDisabled",
    disabled: true,
  },
};
