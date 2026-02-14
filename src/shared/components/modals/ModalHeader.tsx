import { X } from "lucide-react-native";

import { Pressable, Text, View } from "@/src/tw";

export interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="w-10" />
      <View className="flex-1 items-center">
        <Text className="text-xl font-bold text-slate-700">{title}</Text>
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        className="size-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
      >
        <X size={24} color="black" />
      </Pressable>
    </View>
  );
}
