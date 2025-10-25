import { useRef, useState } from "react";

import { TouchableOpacity, View, type TextInput } from "react-native";

import { Eye, EyeClosed, Lock, Mail } from "lucide-react-native";

import { FormButton, FormInput } from "@/src/shared/components/forms";

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

export function FormSection({
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
  const [showPassword, setShowPassword] = useState(false);

  // フォーム入力のref
  const passwordInputRef = useRef<TextInput>(null);

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
    <View className="mb-8 flex w-full flex-col gap-8">
      {/* Email & Password Input */}
      <View className="w-full gap-4">
        <FormInput
          label="Email"
          placeholder={emailConfig.placeholder}
          textContentType={emailConfig.textContentType}
          autoCapitalize={emailConfig.autoCapitalize}
          secureTextEntry={emailConfig.secureTextEntry}
          value={formData.email}
          onChangeText={(value) => handleFieldChange("email", value)}
          error={errors.email}
          leftIcon={<Mail size={16} color="#6B7280" />}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
        />
        <FormInput
          ref={passwordInputRef}
          label="Password"
          placeholder={passwordConfig.placeholder}
          textContentType={passwordConfig.textContentType}
          autoCapitalize={passwordConfig.autoCapitalize}
          secureTextEntry={!showPassword && passwordConfig.secureTextEntry}
          value={formData.password}
          onChangeText={(value) => handleFieldChange("password", value)}
          error={errors.password}
          leftIcon={<Lock size={16} color="#6B7280" />}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          rightIcon={
            passwordConfig.secureTextEntry ? (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeClosed size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      {/* Submit Button */}
      <View className="w-full">
        <FormButton
          title={isSubmitting ? "Loading..." : buttonTitle}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}
