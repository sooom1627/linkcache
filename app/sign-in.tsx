import { View } from "react-native";

import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import type { AuthFormSection } from "@/src/features/auth/types/AuthFormSectionSchema";
import Divider from "@/src/shared/components/layout/Divider";

export default function SignIn() {
  const handleSignIn = async (data: AuthFormSection) => {
    // TODO: Implement sign-in logic
    console.log("Sign in with:", data);
  };

  return (
    <View className="mx-8 flex flex-1 flex-col items-start justify-center">
      {/* SignIn Title */}
      <AuthTitleSection
        title="SignIn"
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
        buttonTitle="SignIn"
        onSubmit={handleSignIn}
      />

      {/* Divider */}
      <Divider text="or" />

      {/* SignIn with Social Media */}
      <SocialOauthSection />
    </View>
  );
}
