import { View } from "react-native";

import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import Divider from "@/src/shared/components/layout/Divider";

export default function CreateAccount() {
  return (
    <View className="mx-8 flex flex-1 flex-col items-start justify-center">
      {/* SignIn Title */}
      <AuthTitleSection
        title="Create Account"
        subtitle="Already have an account?"
        link="/sign-in"
        linkText="SignIn"
      />

      {/* SignIn Form */}
      <FormSection
        emailPlaceholder="Email"
        emailTextContentType="emailAddress"
        passwordPlaceholder="Password"
        passwordTextContentType="password"
        buttonTitle="SignIn"
      />

      {/* Divider */}
      <Divider text="or" />

      {/* SignIn with Social Media */}
      <SocialOauthSection />
    </View>
  );
}
