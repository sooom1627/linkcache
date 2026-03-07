-- link_status.created_at によるソート対応
-- リンクの並び順を links.created_at から link_status.created_at（ユーザーが Inbox に追加した日時）に変更

-- 1. user_links_view に status_created_at を追加
-- security_invoker = true: クエリ実行ユーザーの権限・RLS を適用（SECURITY DEFINER による RLS バイパスを防止）
CREATE OR REPLACE VIEW user_links_view
  WITH (security_invoker = true)
AS
SELECT
  l.id AS link_id,
  l.url,
  l.title,
  l.description,
  l.image_url,
  l.favicon_url,
  l.site_name,
  l.created_at AS link_created_at,
  ls.id AS status_id,
  ls.user_id,
  ls.status,
  ls.triaged_at,
  ls.read_at,
  ls.created_at AS status_created_at
FROM links l
LEFT JOIN link_status ls ON l.id = ls.link_id;

-- 2. get_user_links RPC の ORDER BY を link_status.created_at ベースに変更
CREATE OR REPLACE FUNCTION public.get_user_links(
  p_page_size integer DEFAULT 20,
  p_page integer DEFAULT 0,
  p_status triage_status DEFAULT NULL::triage_status,
  p_is_read boolean DEFAULT NULL::boolean,
  p_limit integer DEFAULT NULL::integer,
  p_order_by text DEFAULT NULL::text,
  p_collection_id uuid DEFAULT NULL::uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id UUID;
  v_offset INT;
  v_total_count INT;
  v_has_more BOOLEAN;
  v_data JSON;
  v_actual_limit INT;
  v_order_clause TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Input validation: reject invalid pagination parameters before any heavy work
  IF p_page_size < 1 OR p_page_size > 100 THEN
    RAISE EXCEPTION 'p_page_size must be between 1 and 100, got %', p_page_size;
  END IF;

  IF p_page < 0 THEN
    RAISE EXCEPTION 'p_page must be >= 0, got %', p_page;
  END IF;

  IF p_limit IS NOT NULL AND (p_limit <= 0 OR p_limit > 1000) THEN
    RAISE EXCEPTION 'p_limit must be between 1 and 1000 when provided, got %', p_limit;
  END IF;

  IF p_limit IS NOT NULL THEN
    v_actual_limit := p_limit;
    v_offset := 0;
  ELSE
    v_actual_limit := p_page_size;
    v_offset := p_page * p_page_size;
  END IF;

  -- triaged_at_asc: link_status.triaged_at 昇順
  -- created_at_desc / null: link_status.created_at 降順（ユーザーが Inbox に追加した日時）
  IF p_order_by = 'triaged_at_asc' THEN
    v_order_clause := 'ORDER BY triaged_at ASC NULLS LAST';
  ELSE
    v_order_clause := 'ORDER BY status_created_at DESC NULLS LAST';
  END IF;

  SELECT COUNT(*)
  INTO v_total_count
  FROM public.user_links_view
  WHERE user_id = v_user_id
    AND (p_status IS NULL OR status = p_status)
    AND (p_is_read IS NULL
         OR (p_is_read = true AND read_at IS NOT NULL)
         OR (p_is_read = false AND read_at IS NULL))
    AND (p_collection_id IS NULL
         OR link_id IN (
           SELECT cl.link_id
           FROM public.collection_links cl
           WHERE cl.collection_id = p_collection_id
         ));

  EXECUTE format('
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT
        status_id,
        user_id,
        status,
        triaged_at,
        read_at,
        link_id,
        url,
        title,
        image_url,
        favicon_url,
        site_name,
        link_created_at
      FROM public.user_links_view
      WHERE user_id = $1
        AND ($2::triage_status IS NULL OR status = $2::triage_status)
        AND ($3::boolean IS NULL
             OR ($3::boolean = true AND read_at IS NOT NULL)
             OR ($3::boolean = false AND read_at IS NULL))
        AND ($6::uuid IS NULL
             OR link_id IN (
               SELECT cl.link_id
               FROM public.collection_links cl
               WHERE cl.collection_id = $6::uuid
             ))
      %s
      LIMIT $4
      OFFSET $5
    ) t',
    v_order_clause
  )
  INTO v_data
  USING v_user_id, p_status, p_is_read, v_actual_limit, v_offset, p_collection_id;

  IF p_limit IS NOT NULL THEN
    v_has_more := false;
  ELSE
    v_has_more := (v_offset + p_page_size) < v_total_count;
  END IF;

  RETURN json_build_object(
    'data', COALESCE(v_data, '[]'::json),
    'hasMore', v_has_more,
    'totalCount', v_total_count
  );
END;
$function$;
