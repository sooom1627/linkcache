import { supabase } from "@/src/shared/lib/supabase";

import type {
  CreateCollectionParams,
  CreateCollectionResponse,
} from "../types/collections.types";

/**
 * コレクションを作成する
 *
 * 認証済みユーザーのコレクションを collections テーブルに追加します。
 *
 * @param params - コレクション作成パラメータ（name, emoji）
 * @returns 作成されたコレクション
 * @throws 未認証時、Supabase エラー時
 */
export async function createCollection(
  params: CreateCollectionParams,
): Promise<CreateCollectionResponse> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const insertPayload = {
    user_id: user.id,
    name: params.name,
    emoji: params.emoji ?? null,
  };

  const result = await supabase
    .from("collections")
    .insert(insertPayload as Record<string, unknown>)
    .select()
    .single();

  const { data, error } = result as {
    data: CreateCollectionResponse | null;
    error: Error | null;
  };

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data returned");
  }

  return data as CreateCollectionResponse;
}
