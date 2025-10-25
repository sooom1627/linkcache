import { Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { SetupProfileScreen } from "@/src/features/users";

export default function InitialSetup() {
  return (
    <SafeAreaView
      edges={["top"]}
      className="flex flex-1 flex-col items-start justify-end bg-slate-100"
    >
      {/* Title */}
      <View className="mb-8 flex w-full flex-col items-center justify-center gap-2 px-4">
        <Text className="text-2xl font-bold text-slate-800">
          Setup Your Profile
        </Text>
        <Text className="text-slate-700">
          Choose your unique user ID and display name
        </Text>
      </View>
      <View className="flex w-full flex-1 flex-col items-start justify-start rounded-[32px] border border-slate-200 bg-white px-4 pt-10">
        <SetupProfileScreen />
      </View>
    </SafeAreaView>
  );
}
