import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface AuthButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function AuthButton({
  title,
  onPress,
  disabled = false,
  isLoading = false,
}: AuthButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`my-4 rounded-3xl p-4 ${
        isDisabled ? "bg-zinc-400" : "bg-zinc-800"
      }`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-center font-bold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
