import React from "react";

import { Alert, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import FormButton from "../../../shared/components/forms/FormButton";
import FormInput from "../../../shared/components/forms/FormInput";
import { useCreateLink } from "../hooks/useCreateLink";
import { linkFormSchema, type LinkFormSchema } from "../types/linkSchema";

export const LinkCreateForm = () => {
  const { mutateAsync: createLink, isPending } = useCreateLink();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LinkFormSchema>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit: SubmitHandler<LinkFormSchema> = async (data) => {
    try {
      await createLink(data.url);
      Alert.alert("成功", "リンクを作成しました", [
        { text: "OK", onPress: () => reset() },
      ]);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "リンクの作成に失敗しました";
      Alert.alert("エラー", errorMessage);
    }
  };

  return (
    <View className="gap-4 p-4">
      <Controller
        control={control}
        name="url"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            label="URL"
            placeholder="https://example.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.url?.message}
            autoCapitalize="none"
            keyboardType="url"
            inputMode="url"
            editable={!isPending}
          />
        )}
      />

      <FormButton
        title={isPending ? "作成中..." : "リンクを作成"}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      />
    </View>
  );
};
