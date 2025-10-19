import { Alert } from "react-native";

import type { PostgrestError } from "@supabase/supabase-js";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { useAuth } from "../../auth";
import { updateProfile } from "../api";
import { userQueryKeys } from "../constants/queryKeys";
import type { UpdateProfileRequest, UserProfile } from "../types";

export function useUpdateProfile(options?: {
  onSuccess?: () => void;
}): UseMutationResult<UserProfile, PostgrestError, UpdateProfileRequest> {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  return useMutation<UserProfile, PostgrestError, UpdateProfileRequest>({
    mutationFn: (profile) => updateProfile(user?.id ?? "", profile),
    onSuccess: (data) => {
      queryClient.setQueryData(userQueryKeys.profile(), data);
      Alert.alert("Success", "Profile updated successfully");
      options?.onSuccess?.();
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update profile");
      console.error("Error updating profile", error);
    },
  });
}
