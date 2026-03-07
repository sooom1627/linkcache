import { ScrollView, Text, View } from "react-native";

import type { Meta, StoryObj } from "@storybook/react";

import { colors } from "@/src/shared/constants/colors";

const colorGroups = [
  {
    title: "背景・サーフェス",
    items: [
      { name: "screen", value: colors.screen },
      { name: "surface", value: colors.surface },
      { name: "surfaceSecondary", value: colors.surfaceSecondary },
      { name: "surfaceMuted", value: colors.surfaceMuted },
      { name: "surfaceMutedActive", value: colors.surfaceMutedActive },
      {
        name: "surfaceMutedActivePressed",
        value: colors.surfaceMutedActivePressed,
      },
      { name: "emptyState", value: colors.emptyState },
    ],
  },
  {
    title: "メイン（Slate）",
    items: [
      { name: "main", value: colors.main },
      { name: "mainHover", value: colors.mainHover },
      { name: "mainDark", value: colors.mainDark },
    ],
  },
  {
    title: "アクセント（Blue）",
    items: [
      { name: "accent", value: colors.accent },
      { name: "accentMuted", value: colors.accentMuted },
    ],
  },
  {
    title: "テキスト",
    items: [
      { name: "textPrimary", value: colors.textPrimary },
      { name: "textSecondary", value: colors.textSecondary },
      { name: "textMuted", value: colors.textMuted },
      { name: "textOnDark", value: colors.textOnDark },
    ],
  },
  {
    title: "アイコン",
    items: [
      { name: "icon", value: colors.icon },
      { name: "iconMuted", value: colors.iconMuted },
      { name: "iconPlaceholder", value: colors.iconPlaceholder },
    ],
  },
  {
    title: "ボーダー",
    items: [
      { name: "border", value: colors.border },
      { name: "borderLight", value: colors.borderLight },
    ],
  },
  {
    title: "セマンティック",
    items: [
      { name: "success", value: colors.success },
      { name: "error", value: colors.error },
      { name: "warning", value: colors.warning },
      { name: "info", value: colors.info },
    ],
  },
  {
    title: "ステータス（Triage）",
    items: [
      { name: "statusNew", value: colors.statusNew },
      { name: "statusReadSoon", value: colors.statusReadSoon },
      { name: "statusStock", value: colors.statusStock },
      { name: "statusDone", value: colors.statusDone },
      { name: "statusDefault", value: colors.statusDefault },
    ],
  },
  {
    title: "フォーム・ボタン",
    items: [
      { name: "disabled", value: colors.disabled },
      { name: "danger", value: colors.danger },
      { name: "dangerDisabled", value: colors.dangerDisabled },
    ],
  },
];

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <View className="mb-2 flex-row items-center">
      <View
        style={{ backgroundColor: value }}
        className="mr-3 size-12 rounded-lg border border-slate-200"
      />
      <View>
        <Text className="text-sm font-medium text-slate-900">{name}</Text>
        <Text className="text-xs text-slate-500">{value}</Text>
      </View>
    </View>
  );
}

function ColorPalette() {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="mb-4 text-xl font-bold text-slate-900">
        Color Palette
      </Text>
      {colorGroups.map((group) => (
        <View key={group.title} className="mb-6">
          <Text className="mb-3 text-base font-semibold text-slate-700">
            {group.title}
          </Text>
          {group.items.map((item) => (
            <ColorSwatch key={item.name} name={item.name} value={item.value} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const meta: Meta<typeof ColorPalette> = {
  title: "Design System/Colors",
  component: ColorPalette,
};

export default meta;

type Story = StoryObj<typeof ColorPalette>;

export const Palette: Story = {};
