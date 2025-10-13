import { View } from "react-native";

import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import type { AuthFormSection } from "@/src/features/auth/types/AuthFormSectionSchema";
import Divider from "@/src/shared/components/layout/Divider";

export default function CreateAccount() {
  const handleCreateAccount = async (data: AuthFormSection) => {
    // TODO: Implement create account logic
    console.log("Create account with:", data);
  };

  return (
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
      <SocialOauthSection />
    </View>
  );
}
