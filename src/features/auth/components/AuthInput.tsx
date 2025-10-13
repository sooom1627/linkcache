import { TextInput, type TextInputProps } from "react-native";

interface AuthInputProps {
  placeholder: string;
  textContentType?: TextInputProps["textContentType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
}

export default function AuthInput({
  placeholder,
  textContentType,
  autoCapitalize = "none",
  secureTextEntry = false,
  value,
  onChangeText,
  error,
}: AuthInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      textContentType={textContentType}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      className={`w-full border-collapse rounded-md bg-zinc-200 p-4 ${
        error ? "border border-red-500" : ""
      }`}
    />
  );
}
