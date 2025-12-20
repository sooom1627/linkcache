import { supabase } from "../../../shared/lib/supabase";
import type { LinkMetadata } from "../utils/metadata";

/**
 * リンク作成結果の型
 */
export interface CreateLinkResponse {
  link_id: string;
  url: string;
  status: string;
}

/**
 * リンクを作成する（または既存のリンクを紐付ける）
 *
 * @param url リンクURL
 * @param metadata メタデータ（タイトル、説明、画像など）
 * @returns 作成されたリンク情報
 */
export async function createLink(
  url: string,
  metadata: LinkMetadata,
): Promise<CreateLinkResponse> {
  const rpcResponse = await supabase.rpc("create_link_with_status", {
    p_url: url,
    p_title: metadata.title || null,
    p_description: metadata.description || null,
    p_image_url: metadata.image_url || null,
    p_favicon_url: metadata.favicon_url || null,
    p_site_name: metadata.site_name || null,
  });

  if (rpcResponse.error) {
    throw rpcResponse.error;
  }

  // RPCの戻り値はJSONB型なので、適切にキャストする
  const responseData = rpcResponse.data as unknown;
  return responseData as CreateLinkResponse;
}
