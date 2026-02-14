import { Avatar } from "@/src/features/users/components/user/Avatar";
import { useProfile } from "@/src/features/users/hooks";
import { useModal } from "@/src/shared/providers";

/**
 * ネイティブStackヘッダーのheaderLeftに配置するアバターボタン
 * タップで設定モーダルを開く
 */
export function AvatarHeaderButton() {
  const { openModal } = useModal();
  const { data: profile } = useProfile();

  return (
    <Avatar
      avatarUrl={profile?.avatar_url}
      updatedAt={profile?.updated_at}
      onPress={() => openModal("setting")}
      size="small"
      accessibilityLabel="Open settings"
    />
  );
}
