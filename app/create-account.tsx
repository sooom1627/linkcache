import { Alert, ScrollView, View } from "react-native";

import { useRouter } from "expo-router";

import { useQueryClient } from "@tanstack/react-query";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useSignUp } from "@/src/features/auth/hooks/useSignUp";
import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import type { AuthFormSection } from "@/src/features/auth/types/AuthFormSectionSchema";
import { userQueryKeys } from "@/src/features/users/constants/queryKeys";
import Divider from "@/src/shared/components/layout/Divider";

export default function CreateAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
        ? "This email address is already registered. Please use a different email address."
        : "Account creation failed. Please try again.";
      Alert.alert("Sign Up Failed", friendlyMessage);
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
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-100">
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        className="flex-1 bg-slate-100"
        contentContainerClassName="flex-1"
      >
        <View className="flex flex-1 flex-col items-start justify-end">
          {/* Create Account Title */}
          <AuthTitleSection
            title="Welcome to Cache! 🎉"
            subtitle="Already have an account?"
            link="/sign-in"
            linkText="SignIn"
          />
          <View
            style={{ paddingBottom: insets.bottom }}
            className="flex w-full flex-col items-start justify-start rounded-t-[32px] border-t border-slate-200 bg-white px-4 pt-10"
          >
            {/* Create Account Form */}
            <FormSection
              emailConfig={{
                name: "email",
                placeholder: "Email",
                textContentType: "emailAddress",
                autoCapitalize: "none",
              }}
              passwordConfig={{
                name: "password",
                placeholder: "Password",
                textContentType: "newPassword",
                autoCapitalize: "none",
                secureTextEntry: true,
              }}
              buttonTitle="Create Account"
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
