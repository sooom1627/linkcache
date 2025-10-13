import { View } from "react-native";

import AuthTitleSection from "@/src/features/auth/screens/AuthTitleSection";
import FormSection from "@/src/features/auth/screens/FormSection";
import SocialOauthSection from "@/src/features/auth/screens/SocialOauthSection";
import Divider from "@/src/shared/components/layout/Divider";

export default function SignIn() {
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
