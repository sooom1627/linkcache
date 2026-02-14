import { Alert } from "react-native";

import { useRouter } from "expo-router";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSignUp } from "@/src/features/auth/hooks/useSignUp";
import { AuthTitleSection } from "@/src/features/auth/screens/AuthTitleSection";
import { FormSection } from "@/src/features/auth/screens/FormSection";
import { SocialOauthSection } from "@/src/features/auth/screens/SocialOauthSection";
import type { AuthFormSection } from "@/src/features/auth/types/authFormSectionSchema.types";
import { userQueryKeys } from "@/src/features/users/constants/queryKeys";
import { Divider } from "@/src/shared/components/layout/Divider";
import { SafeAreaView, ScrollView, View } from "@/src/tw";

export default function CreateAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutateAsync: signUp } = useSignUp({
    onSuccess: (data) => {
      if (!data.session) {
        Alert.alert(
          "Verification Required",
          "Please check your email to verify your account before signing in.",
          [{ text: "OK", onPress: () => router.replace("/sign-in") }],
        );
      } else {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
        router.replace("/");
      }
    },
    onError: (error) => {
      const friendlyMessage = error.message.includes("already registered")
        ? t(
            "auth_messages.create_account_messages.failed_message_already_registered",
          )
        : t("auth_messages.create_account_messages.failed_message_default");
      Alert.alert(
        t("auth_messages.create_account_messages.failed_message_title"),
        friendlyMessage,
      );
    },
  });

  const handleCreateAccount = async (data: AuthFormSection) => {
    await signUp({
      email: data.email,
      password: data.password,
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-background flex-1"
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        className="bg-background flex-1"
        contentContainerClassName="flex-1"
        style={{ flex: 1 }}
      >
        <View className="flex flex-1 flex-col items-start justify-end">
          {/* Create Account Title */}
          <AuthTitleSection
            title={t("auth_messages.create_account_messages.title")}
            subtitle={t("auth_messages.create_account_messages.subtitle")}
            link="/sign-in"
            linkText={t("auth_messages.create_account_messages.linkText")}
          />
          <View
            style={{ paddingBottom: insets.bottom + 8 }}
            className="bg-surface flex w-full flex-col items-start justify-start rounded-t-[32px] px-6 pt-10"
          >
            {/* Create Account Form */}
            <FormSection
              emailConfig={{
                name: "email",
                placeholder: t(
                  "auth_messages.auth_form_messages.email_placeholder",
                ),
                textContentType: "emailAddress",
                autoCapitalize: "none",
              }}
              passwordConfig={{
                name: "password",
                placeholder: t(
                  "auth_messages.auth_form_messages.password_placeholder",
                ),
                textContentType: "newPassword",
                autoCapitalize: "none",
                secureTextEntry: true,
              }}
              buttonTitle={t(
                "auth_messages.create_account_messages.buttonTitle",
              )}
              onSubmit={handleCreateAccount}
            />

            {/* Divider */}
            <Divider text="or" />

            {/* SignIn with Social Media */}
            <SocialOauthSection title="SignUp" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
