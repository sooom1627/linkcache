import { Text, View } from "react-native";

import { UserRound } from "lucide-react-native";

export default function Header() {
  return (
    <View className="px-4">
      <View className="flex-row items-center justify-start gap-4">
        <View className="rounded-full bg-zinc-200 p-4">
          <UserRound size={16} color="black" />
        </View>
        <Text className="text-2xl font-bold text-zinc-700">Hello, User</Text>
      </View>
    </View>
  );
}
