import { View, type TextInputProps } from "react-native";

import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";

interface FormSectionProps {
  emailPlaceholder: string;
  emailTextContentType: TextInputProps["textContentType"];
  passwordPlaceholder: string;
  passwordTextContentType: TextInputProps["textContentType"];
  buttonTitle: string;
}

export default function FormSection({
  emailPlaceholder,
  emailTextContentType,
  passwordPlaceholder,
  passwordTextContentType,
  buttonTitle,
}: FormSectionProps) {
  return (
    <View className="mb-8 flex w-full flex-col gap-4">
      <AuthInput
        placeholder={emailPlaceholder}
        textContentType={emailTextContentType}
        autoCapitalize="none"
      />
      <AuthInput
        placeholder={passwordPlaceholder}
        textContentType={passwordTextContentType}
        autoCapitalize="none"
      />
      <AuthButton title={buttonTitle} />
    </View>
  );
}
