import { Pressable, Text, View } from "react-native";

import { X } from "lucide-react-native";

export interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="w-10" />
      <View className="text-xl font-semibold">
        <Text className="text-xl font-bold text-slate-700">{title}</Text>
      </View>
      <Pressable
        onPress={onClose}
        className="size-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
      >
        <X size={24} color="#000" />
      </Pressable>
    </View>
  );
}
