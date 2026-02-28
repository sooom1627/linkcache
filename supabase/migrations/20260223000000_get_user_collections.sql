-- JOIN を高速化するインデックス (query-missing-indexes best practice)
CREATE INDEX IF NOT EXISTS idx_collection_links_collection_id
  ON collection_links(collection_id);

-- WHERE c.user_id フィルタ用インデックス
CREATE INDEX IF NOT EXISTS idx_collections_user_id
  ON collections(user_id);

CREATE OR REPLACE FUNCTION get_user_collections(
  p_order_by TEXT    DEFAULT 'updated_at',
  p_order    TEXT    DEFAULT 'desc',
  p_limit    INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id          uuid,
  name        text,
  emoji       text,
  items_count bigint
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.emoji,
    COUNT(cl.link_id)::bigint AS items_count
  FROM collections c
  LEFT JOIN collection_links cl ON cl.collection_id = c.id
  WHERE c.user_id = (SELECT auth.uid())
  GROUP BY c.id, c.name, c.emoji, c.updated_at
  ORDER BY
    CASE WHEN p_order_by = 'items_count' AND p_order = 'desc' THEN COUNT(cl.link_id) END DESC NULLS LAST,
    CASE WHEN p_order_by = 'items_count' AND p_order = 'asc'  THEN COUNT(cl.link_id) END ASC  NULLS LAST,
    CASE WHEN p_order_by = 'updated_at'  AND p_order = 'desc' THEN c.updated_at       END DESC NULLS LAST,
    CASE WHEN p_order_by = 'updated_at'  AND p_order = 'asc'  THEN c.updated_at       END ASC  NULLS LAST
  LIMIT COALESCE(NULLIF(p_limit, 0), 1000);
$$;
