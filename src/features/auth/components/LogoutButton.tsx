import { Alert, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { FormButton } from "@/src/shared/components/forms";
import { showToastError, showToastSuccess } from "@/src/shared/utils/toast";

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
  const { t } = useTranslation();
  const { mutate: signOut, isPending } = useSignOut({
    onSuccess: () => {
      onLogoutSuccess?.();
      showToastSuccess(t("auth_messages.logout_messages.success"));
      router.replace("/sign-in");
    },
    onError: () => {
      showToastError(t("auth_messages.logout_messages.error"));
    },
  });

  const handleLogout = () => {
    Alert.alert(
      t("auth_messages.logout_messages.confirm_title"),
      t("auth_messages.logout_messages.confirm_message"),
      [
        { text: t("auth_messages.logout_messages.cancel"), style: "cancel" },
        {
          text: t("auth_messages.logout_messages.confirm"),
          onPress: () => signOut(),
          style: "destructive",
        },
      ],
    );
  };
  return (
    <View className="w-full">
      <FormButton
        title={isPending ? "Logging out..." : "Logout"}
        onPress={handleLogout}
        disabled={isPending}
        disabledColor={disabledColor ?? "bg-dangerDisabled"}
        enabledColor={enabledColor ?? "bg-danger"}
      />
    </View>
  );
}
