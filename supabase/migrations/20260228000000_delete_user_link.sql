-- collection_links と link_status をアトミックに削除する RPC 関数
-- PL/pgSQL 関数本体は暗黙のトランザクションで実行される
CREATE OR REPLACE FUNCTION delete_user_link(p_link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- RLS により、自分が所有するコレクションに紐づくレコードのみ削除される
  DELETE FROM collection_links WHERE link_id = p_link_id;

  -- RLS により、自分の link_status のみ削除される
  DELETE FROM link_status WHERE link_id = p_link_id;
END;
$$;
