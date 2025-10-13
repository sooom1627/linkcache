import { useCallback, useState } from "react";

import { Alert, View } from "react-native";

import { Text } from "@react-navigation/elements";
import type { AuthError } from "@supabase/supabase-js";

import { useOAuthSignIn } from "@/src/features/auth/hooks/useOAuthSignIn";

import SocialMediaButton, {
  type Provider,
} from "../components/SocialMediaButton";

const OAUTH_PROVIDERS: Provider[] = ["google", "github", "apple"];

interface SocialOauthSectionProps {
  title: string;
  onSuccess?: (provider: Provider) => void;
  onError?: (error: AuthError, provider: Provider) => void;
}

export default function SocialOauthSection({
  title,
  onSuccess,
  onError,
}: SocialOauthSectionProps) {
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const { mutateAsync: signInWithOAuth } = useOAuthSignIn();

  const handleSocialSignIn = useCallback(
    async (provider: Provider) => {
      try {
        setPendingProvider(provider);
        await signInWithOAuth(provider);
        onSuccess?.(provider);
      } catch (error) {
        const authError = error as AuthError;
        if (onError) {
          onError(authError, provider);
        } else {
          Alert.alert(
            "Social sign-in failed",
            authError?.message ??
              "We couldn't continue with that provider. Please try again.",
          );
        }
      } finally {
        setPendingProvider(null);
      }
    },
    [onError, onSuccess, signInWithOAuth],
  );

  return (
    <View className="flex w-full flex-col items-center justify-center gap-4">
      <View className="flex w-full flex-col items-center justify-center gap-2">
        <Text className="text-zinc-700">
          {title} with your favorite social media account.
        </Text>
      </View>
      <View className="flex w-full flex-col items-center gap-4">
        {OAUTH_PROVIDERS.map((provider) => (
          <SocialMediaButton
            key={provider}
            provider={provider}
            onPress={() => void handleSocialSignIn(provider)}
            disabled={pendingProvider !== null}
            loading={pendingProvider === provider}
          />
        ))}
      </View>
    </View>
  );
}
