import { Text, TouchableOpacity, View } from "react-native";

import { Link } from "expo-router";

import AuthButton from "@/src/features/auth/components/AuthButton";
import AuthInput from "@/src/features/auth/components/AuthInput";
import Divider from "@/src/shared/components/layout/Divider";

export default function SignIn() {
  return (
    <View className="mx-8 flex flex-1 flex-col items-start justify-center">
      {/* SignIn Title */}
      <View className="mb-8 flex w-full flex-col gap-2">
        <Text className="text-4xl font-bold text-zinc-800">SignIn</Text>
        <Text className="text-zinc-700">
          New here?{" "}
          <Link href="/create-account" className="text-blue-500 underline">
            Create an account
          </Link>
        </Text>
      </View>

      {/* SignIn Form */}
      <View className="mb-8 flex w-full flex-col gap-4">
        <AuthInput
          placeholder="Email"
          textContentType="emailAddress"
          autoCapitalize="none"
        />
        <AuthInput
          placeholder="Password"
          textContentType="password"
          autoCapitalize="none"
        />
        <AuthButton title="SignIn" />
      </View>

      {/* Divider */}
      <Divider text="or" />

      {/* SignIn with Social Media */}
      <View className="w-full">
        <View className="flex w-full flex-row items-center justify-center gap-2">
          <Text className="text-zinc-700">
            SignIn with your favorite social media account.
          </Text>
        </View>
        <View className="flex w-full flex-row items-center gap-2">
          <TouchableOpacity className="my-4 rounded-3xl bg-zinc-500 p-4">
            <Text className="text-center font-bold text-white">
              SignIn with Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="my-4 rounded-3xl bg-zinc-500 p-4">
            <Text className="text-center font-bold text-white">
              SignIn with Apple
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
