import { ScrollView, Text, View } from "react-native";

import type { Meta, StoryObj } from "@storybook/react";

const spacingTokens = [
  { label: "0", value: 0, className: "w-0" },
  { label: "0.5 (2px)", value: 2, className: "w-0.5" },
  { label: "1 (4px)", value: 4, className: "w-1" },
  { label: "2 (8px)", value: 8, className: "w-2" },
  { label: "3 (12px)", value: 12, className: "w-3" },
  { label: "4 (16px)", value: 16, className: "w-4" },
  { label: "5 (20px)", value: 20, className: "w-5" },
  { label: "6 (24px)", value: 24, className: "w-6" },
  { label: "8 (32px)", value: 32, className: "w-8" },
  { label: "10 (40px)", value: 40, className: "w-10" },
  { label: "12 (48px)", value: 48, className: "w-12" },
  { label: "16 (64px)", value: 64, className: "w-16" },
];

const radiusTokens = [
  { label: "none", className: "rounded-none" },
  { label: "sm (2px)", className: "rounded-sm" },
  { label: "md (6px)", className: "rounded-md" },
  { label: "lg (8px)", className: "rounded-lg" },
  { label: "xl (12px)", className: "rounded-xl" },
  { label: "2xl (16px)", className: "rounded-2xl" },
  { label: "full", className: "rounded-full" },
];

function SpacingShowcase() {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="mb-4 text-xl font-bold text-slate-900">
        Spacing & Radius
      </Text>

      {/* Spacing */}
      <View className="mb-8">
        <Text className="mb-3 text-base font-semibold text-slate-700">
          Spacing Scale
        </Text>
        {spacingTokens.map((token) => (
          <View key={token.label} className="mb-2 flex-row items-center">
            <Text className="w-24 text-xs text-slate-500">{token.label}</Text>
            <View
              style={{ width: token.value }}
              className="h-4 rounded-sm bg-accent"
            />
          </View>
        ))}
      </View>

      {/* Border Radius */}
      <View className="mb-8">
        <Text className="mb-3 text-base font-semibold text-slate-700">
          Border Radius
        </Text>
        <View className="flex-row flex-wrap gap-4">
          {radiusTokens.map((token) => (
            <View key={token.label} className="items-center">
              <View className={`mb-2 size-16 bg-main ${token.className}`} />
              <Text className="text-xs text-slate-500">{token.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const meta: Meta<typeof SpacingShowcase> = {
  title: "Design System/Spacing",
  component: SpacingShowcase,
};

export default meta;

type Story = StoryObj<typeof SpacingShowcase>;

export const Scale: Story = {};
