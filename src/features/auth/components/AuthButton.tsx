import { Text, TouchableOpacity } from "react-native";

export default function AuthButton({ title }: { title: string }) {
  return (
    <TouchableOpacity className="my-4 rounded-3xl bg-zinc-500 p-4">
      <Text className="text-center font-bold text-white">{title}</Text>
    </TouchableOpacity>
  );
}
