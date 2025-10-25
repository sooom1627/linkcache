import { Alert, ScrollView, View } from "react-native";

import { useRouter } from "expo-router";

import { useQueryClient } from "@tanstack/react-query";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useSignIn } from "@/src/features/auth/hooks/useSignIn";
import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import type { AuthFormSection } from "@/src/features/auth/types/AuthFormSectionSchema";
import { userQueryKeys } from "@/src/features/users/constants/queryKeys";
import Divider from "@/src/shared/components/layout/Divider";

export default function SignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: signIn } = useSignIn({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
      router.replace("/");
    },
    onError: (error) => {
      const friendlyMessage = error.message.includes("invalid credentials")
        ? "Invalid email or password. Please try again."
        : "Sign in failed. Please try again.";
      Alert.alert("Sign In Failed", friendlyMessage);
    },
  });

  const handleSignIn = async (data: AuthFormSection) => {
    await signIn({
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
          {/* SignIn Title */}
          <AuthTitleSection
            title="Hi, Welcome Back! 👋"
            subtitle="New here?"
            link="/create-account"
            linkText="Create an account"
          />
          <View
            style={{ paddingBottom: insets.bottom }}
            className="flex w-full flex-col items-start justify-start rounded-t-[32px] bg-white px-4 pt-10"
          >
            {/* SignIn Form */}
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
                textContentType: "password",
                autoCapitalize: "none",
                secureTextEntry: true,
              }}
              buttonTitle="Sign In"
              onSubmit={handleSignIn}
            />

            {/* Divider */}
            <Divider text="or" />

            {/* SignIn with Social Media */}
            <SocialOauthSection title="Sign In" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
