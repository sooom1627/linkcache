/**
 * ユーザープロフィール情報
 */
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  updated_at?: string;
}

/**
 * プロフィール作成リクエスト
 */
export interface CreateProfileRequest {
  user_id: string;
  username: string;
}

/**
 * user_id重複チェックのレスポンス
 */
export interface CheckUserIdResponse {
  isAvailable: boolean;
}
