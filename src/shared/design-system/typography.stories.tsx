import { ScrollView, Text, View } from "react-native";

import type { Meta, StoryObj } from "@storybook/react";

const typographyStyles = [
  {
    title: "見出し",
    items: [
      { label: "Heading XL", className: "text-2xl font-bold", sample: "見出し XL - 24px Bold" },
      { label: "Heading L", className: "text-xl font-bold", sample: "見出し L - 20px Bold" },
      { label: "Heading M", className: "text-lg font-semibold", sample: "見出し M - 18px SemiBold" },
      { label: "Heading S", className: "text-base font-semibold", sample: "見出し S - 16px SemiBold" },
    ],
  },
  {
    title: "本文",
    items: [
      { label: "Body L", className: "text-base", sample: "本文 L - 16px Regular" },
      { label: "Body M", className: "text-sm", sample: "本文 M - 14px Regular" },
      { label: "Body S", className: "text-xs", sample: "本文 S - 12px Regular" },
    ],
  },
  {
    title: "ラベル・キャプション",
    items: [
      { label: "Label", className: "text-sm font-medium", sample: "ラベル - 14px Medium" },
      { label: "Caption", className: "text-xs text-slate-500", sample: "キャプション - 12px Muted" },
    ],
  },
  {
    title: "ボタンテキスト",
    items: [
      { label: "Button L", className: "text-base font-semibold", sample: "ボタン L - 16px SemiBold" },
      { label: "Button M", className: "text-sm font-semibold", sample: "ボタン M - 14px SemiBold" },
    ],
  },
];

function TypographyShowcase() {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="mb-4 text-xl font-bold text-slate-900">
        Typography
      </Text>
      {typographyStyles.map((group) => (
        <View key={group.title} className="mb-6">
          <Text className="mb-3 text-base font-semibold text-slate-700">
            {group.title}
          </Text>
          {group.items.map((item) => (
            <View key={item.label} className="mb-4 border-b border-slate-100 pb-3">
              <Text className="mb-1 text-xs text-slate-400">
                {item.label} ({item.className})
              </Text>
              <Text className={`text-slate-900 ${item.className}`}>
                {item.sample}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const meta: Meta<typeof TypographyShowcase> = {
  title: "Design System/Typography",
  component: TypographyShowcase,
};

export default meta;

type Story = StoryObj<typeof TypographyShowcase>;

export const Styles: Story = {};
