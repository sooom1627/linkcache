import { z } from "zod";

export const AuthFormSectionSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password is too long" }),
});

export type AuthFormSection = z.infer<typeof AuthFormSectionSchema>;

export type AuthFormFieldName = keyof AuthFormSection;

export interface AuthFormFieldConfig {
  name: AuthFormFieldName;
  placeholder: string;
  textContentType: "emailAddress" | "password" | "newPassword";
  autoCapitalize: "none";
  secureTextEntry?: boolean;
}

export interface AuthFormConfig {
  fields: {
    email: AuthFormFieldConfig;
    password: AuthFormFieldConfig;
  };
  buttonTitle: string;
  onSubmit: (data: AuthFormSection) => void | Promise<void>;
}
