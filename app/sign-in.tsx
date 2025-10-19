import { Alert, View } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { useSignIn } from "@/src/features/auth/hooks/useSignIn";
import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import type { AuthFormSection } from "@/src/features/auth/types/AuthFormSectionSchema";
import Divider from "@/src/shared/components/layout/Divider";

export default function SignIn() {
  const router = useRouter();
  const { mutateAsync: signIn } = useSignIn({
    onSuccess: () => {
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-8 flex flex-1 flex-col items-start justify-center">
        {/* SignIn Title */}
        <AuthTitleSection
          title="Sign In"
          subtitle="New here?"
          link="/create-account"
          linkText="Create an account"
        />

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
    </SafeAreaView>
  );
}
