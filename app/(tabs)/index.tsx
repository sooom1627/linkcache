import { Alert, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { useSignOut } from "@/src/features/auth/hooks/useSignOut";
import { FormButton } from "@/src/shared/components/forms";

export default function Index() {
  const router = useRouter();
  const { mutate: signOut, isPending } = useSignOut({
    onSuccess: () => {
      Alert.alert("Success", "Logged out successfully", [
        { text: "OK", onPress: () => router.replace("/sign-in") },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => signOut(), style: "destructive" },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text className="mb-4 text-2xl font-bold">Home Screen</Text>
        <Text className="mb-8 text-center text-gray-600">
          You are logged in!
        </Text>

        {/* Logout Button */}
        <View style={{ width: "100%" }}>
          <FormButton
            title={isPending ? "Logging out..." : "Logout"}
            onPress={handleLogout}
            disabled={isPending}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
