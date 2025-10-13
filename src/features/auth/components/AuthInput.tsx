import { TextInput, type TextInputProps } from "react-native";

interface AuthInputProps {
  placeholder: string;
  textContentType?: TextInputProps["textContentType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
}

export default function AuthInput({
  placeholder,
  textContentType,
}: AuthInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      textContentType={textContentType}
      autoCapitalize="none"
      className="w-full border-collapse rounded-md bg-zinc-200 p-4"
    />
  );
}
