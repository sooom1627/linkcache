/**
 * ユーザープロフィール情報
 */
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  updated_at?: string;
  created_at?: string;
}

/**
 * プロフィール更新リクエスト
 */
export interface UpdateProfileRequest {
  user_id: string;
  username: string;
}
