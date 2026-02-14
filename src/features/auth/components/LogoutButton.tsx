import { Alert } from "react-native";

import { useRouter } from "expo-router";

import { FormButton } from "@/src/shared/components/forms";
import { View } from "@/src/tw";

import { useSignOut } from "../hooks";

interface LogoutButtonProps {
  disabledColor?: string;
  enabledColor?: string;
  onLogoutSuccess?: () => void;
}

export default function LogoutButton({
  disabledColor,
  enabledColor,
  onLogoutSuccess,
}: LogoutButtonProps) {
  const router = useRouter();
  const { mutate: signOut, isPending } = useSignOut({
    onSuccess: () => {
      onLogoutSuccess?.();
      Alert.alert("Success", "Logged out successfully");
      router.replace("/sign-in");
    },
    onError: () => {
      Alert.alert("Error", "Something went wrong. Please try again.");
    },
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => signOut(), style: "destructive" },
    ]);
  };
  return (
    <View className="w-full">
      <FormButton
        title={isPending ? "Logging out..." : "Logout"}
        onPress={handleLogout}
        disabled={isPending}
        disabledColor={disabledColor ?? "bg-danger-disabled"}
        enabledColor={enabledColor ?? "bg-danger"}
      />
    </View>
  );
}
