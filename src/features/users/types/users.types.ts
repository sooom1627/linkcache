/**
 * ユーザープロフィール情報
 */
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  updated_at?: string;
}

/**
 * user_id重複チェックのレスポンス
 */
export interface CheckUserIdResponse {
  isAvailable: boolean;
}

/**
 * プロフィール更新リクエスト
 */
export interface UpdateProfileRequest {
  user_id: string;
  username: string;
}
