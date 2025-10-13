import { useState } from "react";

import { Text, View } from "react-native";

import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import {
  AuthFormSectionSchema,
  type AuthFormFieldConfig,
  type AuthFormSection,
} from "../types/AuthFormSectionSchema";

interface FormSectionProps {
  emailConfig: AuthFormFieldConfig;
  passwordConfig: AuthFormFieldConfig;
  buttonTitle: string;
  onSubmit: (data: AuthFormSection) => void | Promise<void>;
}

export default function FormSection({
  emailConfig,
  passwordConfig,
  buttonTitle,
  onSubmit,
}: FormSectionProps) {
  const [formData, setFormData] = useState<AuthFormSection>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof AuthFormSection, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: keyof AuthFormSection, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const result = AuthFormSectionSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AuthFormSection, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AuthFormSection;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="mb-8 flex w-full flex-col gap-4">
      <View>
        <AuthInput
          placeholder={emailConfig.placeholder}
          textContentType={emailConfig.textContentType}
          autoCapitalize={emailConfig.autoCapitalize}
          secureTextEntry={emailConfig.secureTextEntry}
          value={formData.email}
          onChangeText={(value) => handleFieldChange("email", value)}
          error={errors.email}
        />
        {errors.email && (
          <Text className="mt-1 text-sm text-red-600">{errors.email}</Text>
        )}
      </View>

      <View>
        <AuthInput
          placeholder={passwordConfig.placeholder}
          textContentType={passwordConfig.textContentType}
          autoCapitalize={passwordConfig.autoCapitalize}
          secureTextEntry={passwordConfig.secureTextEntry}
          value={formData.password}
          onChangeText={(value) => handleFieldChange("password", value)}
          error={errors.password}
        />
        {errors.password && (
          <Text className="mt-1 text-sm text-red-600">{errors.password}</Text>
        )}
      </View>

      <AuthButton
        title={buttonTitle}
        onPress={handleSubmit}
        disabled={isSubmitting}
        isLoading={isSubmitting}
      />
    </View>
  );
}
