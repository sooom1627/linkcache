import { Text, View } from "react-native";

interface SettingMenuSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SettingMenuSection({
  title,
  children,
}: SettingMenuSectionProps) {
  return (
    <View className="flex-col gap-2">
      <Text className="font-bold text-slate-500">{title}</Text>
      <View className="flex flex-col items-center justify-around gap-2 rounded-3xl bg-surfaceMuted px-2 py-4">
        {children}
      </View>
    </View>
  );
}
