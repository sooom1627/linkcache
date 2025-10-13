import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";

import { useRouter } from "expo-router";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useSignUp } from "@/src/features/auth/hooks/useSignUp";
import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import type { AuthFormSection } from "@/src/features/auth/types/AuthFormSectionSchema";
import Divider from "@/src/shared/components/layout/Divider";

export default function CreateAccount() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mutate: signUp } = useSignUp({
    onSuccess: (data) => {
      if (!data.session) {
        Alert.alert(
          "Verification Required",
          "Please check your email to verify your account before signing in.",
          [{ text: "OK", onPress: () => router.replace("/sign-in") }],
        );
      } else {
        router.replace("/(protected)/setup-profile");
      }
    },
    onError: (error) => {
      const friendlyMessage = error.message.includes("already registered")
        ? "This email address is already registered. Please use a different email address."
        : "Account creation failed. Please try again.";
      Alert.alert("Sign Up Failed", friendlyMessage);
    },
  });

  const handleCreateAccount = (data: AuthFormSection) => {
    signUp({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
        className="flex-1"
      >
        <View className="mx-8 flex flex-1 flex-col items-start justify-center">
          {/* Create Account Title */}
          <AuthTitleSection
            title="Create Account"
            subtitle="Already have an account?"
            link="/sign-in"
            linkText="SignIn"
          />

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
